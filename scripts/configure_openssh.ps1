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
    
    $NewContent += $line
}

# Save with UTF-8 no BOM
$NewContent | Out-File -FilePath $ConfigPath -Encoding UTF8NoBOM
Write-Host "-> Configuration updated successfully"

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
