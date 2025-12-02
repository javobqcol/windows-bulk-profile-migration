# configure_openssh.ps1 - VERSIÓN CORREGIDA
# Compatible con PowerShell 5.1 (Windows normal)

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

# SOLUCIÓN 1: ASCII (seguro, compatible)
$NewContent | Out-File -FilePath $ConfigPath -Encoding ASCII
Write-Host "-> Configuration updated (ASCII encoding)"

# SOLUCIÓN 2: UTF-8 sin BOM manual (más elegante)
# $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $false
# [System.IO.File]::WriteAllLines($ConfigPath, $NewContent, $Utf8NoBomEncoding)

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
