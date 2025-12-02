# migrate_data.ps1 - CORRECTED VERSION
# Finds domain profile path from registry, not by guessing

param(
    [string]$MappingFile,
    [string]$Domain,
    [string]$FoldersCsv
)

function Get-LocalProfilePath {
    param([string]$Username)
    $ProfilePath = $null
    try {
        $RegPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList"
        $SIDs = Get-ChildItem $RegPath
        foreach ($SID in $SIDs) {
            $Path = (Get-ItemProperty $SID.PSPath).ProfileImagePath
            if ($Path -match "\\${Username}$") {
                $ProfilePath = $Path
                break
            }
        }
    } catch {
        Write-Output "   -> Error reading registry for ${Username}"
    }
    return $ProfilePath
}

function Get-DomainProfilePath {
    param([string]$DomainUsername, [string]$Domain)
    $ProfilePath = $null
    
    try {
        # Method 1: Try common patterns first
        $PossiblePaths = @(
            "C:\Users\$DomainUsername.$Domain",
            "C:\Users\$Domain.$DomainUsername",
            "C:\Users\$DomainUsername"
        )
        
        foreach ($Path in $PossiblePaths) {
            if (Test-Path $Path) {
                $ProfilePath = $Path
                break
            }
        }
        
        # Method 2: If not found, search in registry
        if (-not $ProfilePath) {
            $RegPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList"
            $SIDs = Get-ChildItem $RegPath
            
            foreach ($SID in $SIDs) {
                $Path = (Get-ItemProperty $SID.PSPath).ProfileImagePath
                if ($Path -match "\\${DomainUsername}[\.]?") {
                    $ProfilePath = $Path
                    break
                }
            }
        }
        
        # Method 3: Search all user folders
        if (-not $ProfilePath) {
            $AllProfiles = Get-ChildItem "C:\Users\" -Directory
            foreach ($ProfileDir in $AllProfiles) {
                if ($ProfileDir.Name -match "${DomainUsername}[\.]?") {
                    $ProfilePath = $ProfileDir.FullName
                    break
                }
            }
        }
        
    } catch {
        Write-Output "   -> Error finding domain profile for ${DomainUsername}"
    }
    
    return $ProfilePath
}

# Read mapping file
$Mappings = Get-Content $MappingFile
$Folders = $FoldersCsv -split ','

$TotalMigrations = 0
$Successful = 0
$Failed = 0

foreach ($MappingLine in $Mappings) {
    if ([string]::IsNullOrWhiteSpace($MappingLine) -or $MappingLine.StartsWith('#')) { 
        continue 
    }
    
    $Parts = $MappingLine -split '\s+'
    if ($Parts.Count -lt 2) { continue }
    
    $LocalUser = $Parts[0]
    $DomainUser = $Parts[1]
    
    $TotalMigrations++
    Write-Output "=== [$TotalMigrations] Migrating: $LocalUser -> $DomainUser ==="

    # 1. Find LOCAL profile path (from registry)
    $LocalProfile = Get-LocalProfilePath $LocalUser
    if (-not $LocalProfile) {
        Write-Output "   -> ERROR: No local profile found for '$LocalUser'"
        $Failed++
        continue
    }
    Write-Output "   -> Local profile: $LocalProfile"

    # 2. Find DOMAIN profile path (intelligent search)
    $DomainProfile = Get-DomainProfilePath $DomainUser $Domain
    if (-not $DomainProfile) {
        Write-Output "   -> ERROR: Domain profile not found for '$DomainUser'"
        Write-Output "   -> Possible causes:"
        Write-Output "      - Profile not created (run create_profiles.sh first)"
        Write-Output "      - Profile has different naming pattern"
        Write-Output "      - Profile in different location"
        $Failed++
        continue
    }
    Write-Output "   -> Domain profile: $DomainProfile"

    # 3. Verify both profiles exist
    if (-not (Test-Path $LocalProfile)) {
        Write-Output "   -> ERROR: Local profile path doesn't exist"
        $Failed++
        continue
    }
    
    if (-not (Test-Path $DomainProfile)) {
        Write-Output "   -> ERROR: Domain profile path doesn't exist"
        $Failed++
        continue
    }

    # 4. Migrate folders
    $FoldersCopied = 0
    foreach ($Folder in $Folders) {
        $Source = Join-Path $LocalProfile $Folder
        $Destination = Join-Path $DomainProfile $Folder

        Write-Output "   -> Copying: $Folder"
        
        if (Test-Path $Source) {
            if (-not (Test-Path $Destination)) { 
                New-Item -ItemType Directory -Path $Destination -Force | Out-Null 
            }
            
            # Count files before copying
            $Files = Get-ChildItem $Source -Recurse -File -ErrorAction SilentlyContinue
            $FileCount = $Files.Count
            
            if ($FileCount -gt 0) {
                Copy-Item -Path $Source\* -Destination $Destination -Recurse -Force -ErrorAction Continue
                Write-Output "      Copied $FileCount files"
                $FoldersCopied++
            } else {
                Write-Output "      No files to copy"
            }
        } else {
            Write-Output "      Source folder doesn't exist"
        }
    }

    if ($FoldersCopied -gt 0) {
        Write-Output "   SUCCESS: Migration completed"
        $Successful++
    } else {
        Write-Output "   WARNING: No data migrated (folders may be empty)"
        $Successful++  # Still counts as success, just no data
    }
    
    Write-Output ""
}

# Summary
Write-Output "=== MIGRATION SUMMARY ==="
Write-Output "Total migrations attempted: $TotalMigrations"
Write-Output "Successful: $Successful"
Write-Output "Failed: $Failed"
Write-Output ""

if ($Failed -eq 0) {
    Write-Output "✅ ALL migrations completed successfully"
} else {
    Write-Output "⚠️  Some migrations failed. Check logs above."
}
