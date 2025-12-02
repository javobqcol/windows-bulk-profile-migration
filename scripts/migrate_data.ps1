<#
.SYNOPSIS
    Migrate user data from local profiles to domain profiles.
.DESCRIPTION
    Copies specified folders (Documents, Desktop, Pictures, etc.) from 
    local user profiles to domain user profiles.
.PARAMETER UserFile
    Path to user mapping file (format: local_username domain_username).
.PARAMETER Domain
    Domain name (e.g., SAMDOM).
.PARAMETER FoldersCsv
    Comma-separated list of folders to migrate.
.EXAMPLE
    .\migrate_data.ps1 "C:\Temp\users.txt" "SAMDOM" "Documents,Desktop,Pictures"
#>
param(
    [string]$UserFile,
    [string]$Domain,
    [string]$FoldersCsv
)

# Clean parameters (remove stray quotes)
$FoldersCsv = $FoldersCsv.Trim("'", '"', ' ')

# Display help if requested
if ($UserFile -eq "-?" -or $UserFile -eq "-help" -or $UserFile -eq "--help") {
    Get-Help $MyInvocation.MyCommand.Path
    exit 0
}

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
        Write-Output ("   -> Error reading registry for ${Username}: " + $_.Exception.Message)
    }
    return $ProfilePath
}

Write-Output "=== Starting migration ==="
Write-Output "Folders to migrate: $FoldersCsv"
Write-Output ""

$Users = Get-Content $UserFile
$Folders = $FoldersCsv -split ',' | ForEach-Object { $_.Trim() }

foreach ($UserLine in $Users) {
    if ([string]::IsNullOrWhiteSpace($UserLine)) { continue }
    $Parts = $UserLine -split '\s+'
    $User = $Parts[0]

    Write-Output ("=== Processing user: $User ===")

    $LocalProfile = Get-LocalProfilePath $User
    if (-not $LocalProfile) {
        Write-Output ("   -> No local profile found for ${User}, skipping.")
        continue
    } else {
        Write-Output ("   -> Local profile: ${LocalProfile}")
    }

    $DomainProfile = "C:\Users\$User.$Domain"
    Write-Output ("   -> Domain profile target: ${DomainProfile}")

    foreach ($Folder in $Folders) {
        $Src = Join-Path $LocalProfile $Folder
        $Dst = Join-Path $DomainProfile $Folder

        Write-Output ("   -> Copying ${Folder}: ${Src} -> ${Dst}")

        if (Test-Path $Src) {
            if (-not (Test-Path $Dst)) { 
                New-Item -ItemType Directory -Path $Dst | Out-Null 
                Write-Output ("      -> Created destination directory")
            }
            
            $ItemCount = (Get-ChildItem $Src -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count
            if ($ItemCount -gt 0) {
                Copy-Item -Path $Src\* -Destination $Dst -Recurse -Force
                Write-Output ("      -> Copied ${ItemCount} items")
            } else {
                Write-Output ("      -> Source folder is empty")
            }
        } else {
            Write-Output ("      -> Source folder does not exist: ${Src}")
        }
    }

    Write-Output ("   -> Migration complete for ${User}")
    Write-Output ("")
}

Write-Output "=== Migration completed ==="
