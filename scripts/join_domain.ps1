# join_domain.ps1
# Join Windows machine to Active Directory domain

param(
    [string]$Domain,
    [string]$User,
    [string]$Password
)

Write-Host "=== Joining to domain: $Domain ==="

try {
    # Verify domain connectivity
    Write-Host "-> Checking connectivity to $Domain..."
    if (!(Test-Connection -ComputerName $Domain -Count 2 -Quiet)) {
        Write-Host "ERROR: Cannot reach domain $Domain"
        Write-Host "Please verify DNS and network connectivity"
        exit 1
    }
    
    Write-Host "   Domain reachable"
    
    # Convert password to secure string
    $SecurePassword = ConvertTo-SecureString $Password -AsPlainText -Force
    $Credentials = New-Object System.Management.Automation.PSCredential ($User, $SecurePassword)

    Write-Host "-> Joining machine to domain $Domain..."
    
    # Join domain
    Add-Computer -DomainName $Domain -Credential $Credentials -Verbose -ErrorAction Stop

    Write-Host "   SUCCESS: Machine joined domain"
    Write-Host ""
    Write-Host "IMPORTANT:"
    Write-Host "   - Restart the machine manually"
    Write-Host "   - After restart, run configure_openssh.ps1"
    Write-Host ""
    exit 0
}
catch {
    Write-Host "ERROR joining domain:"
    Write-Host "   Message: $($_.Exception.Message)"
    Write-Host "   Please verify:"
    Write-Host "   1. Correct credentials"
    Write-Host "   2. User has permissions to join computers"
    Write-Host "   3. Machine is not already in the domain"
    exit 1
}
