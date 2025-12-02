# configure_openssh.ps1
# Configure OpenSSH Server for domain user authentication

Write-Host "=== Configuring OpenSSH for Domain Users ==="

$ConfigPath = "C:\ProgramData\ssh\sshd_config"

if (!(Test-Path $ConfigPath)) {
    Write-Host "ERROR: Configuration file not found: $ConfigPath"
    exit 1
}

# Create backup
$BackupPath = "$ConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $ConfigPath $BackupPath -Force
Write-Host "-> Backup created: $BackupPath"

# Read and filter configuration
$OriginalContent = Get-Content $ConfigPath
$NewContent = @()

foreach ($line in $OriginalContent) {
    # Remove Match Group restrictions
    if ($line -match '^Match Group') {
        Write-Host "   Removing restriction: $line"
        continue
    }
    
    # CRITICAL: Remove AuthorizedKeysFile restrictions
    if ($line -match '^AuthorizedKeysFile') {
        Write-Host "   Removing AuthorizedKeysFile restriction: $line"
        Write-Host "   (Allows normal user authentication)"
        continue
    }
    
    $NewContent += $line
}

# Save with ASCII encoding
$NewContent | Out-File -FilePath $ConfigPath -Encoding ASCII
Write-Host "-> Configuration updated"
Write-Host "   Removed Match Group restrictions"
Write-Host "   Removed AuthorizedKeysFile restrictions"

# Restart service
Write-Host "-> Restarting SSH service..."
try {
    Restart-Service sshd -Force -ErrorAction Stop
    Write-Host "SSH service restarted"
} catch {
    Write-Host "Warning: Could not restart service"
    Write-Host "Manual command: Restart-Service sshd"
}

Write-Host "=== OpenSSH ready for domain users ==="
Write-Host ""
Write-Host "NEXT: Join machine to domain"
Write-Host "Command:"
Write-Host "sshpass -p '0lucr4d0n' ssh estudiante@inem-23.local \"
Write-Host "  \"powershell -ExecutionPolicy Bypass -File C:\\Windows\\Temp\\join_domain.ps1 \"
Write-Host "  -Domain SAMDOM -User administrator -Pass 'PASSWORD_DEL_DOMINIO'\""
Write-Host ""
Write-Host "IMPORTANT: Use -ExecutionPolicy Bypass"
