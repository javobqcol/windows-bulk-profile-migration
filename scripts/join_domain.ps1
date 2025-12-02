# join_domain.ps1
# Join Windows machine to Active Directory domain

param(
    [string]$Domain,
    [string]$User,
    [string]$Pass
)

Write-Host "=== Joining to domain: $Domain ==="

try {
    Write-Host "-> Checking connectivity to $Domain..."
    if (!(Test-Connection -ComputerName $Domain -Count 2 -Quiet)) {
        Write-Host "ERROR: Cannot reach domain $Domain"
        exit 1
    }
    
    Write-Host "   Domain reachable"
    
    $secpass = ConvertTo-SecureString $Pass -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential ($User, $secpass)

    Write-Host "-> Joining machine to domain $Domain..."
    
    Add-Computer -DomainName $Domain -Credential $cred -Verbose -ErrorAction Stop

    Write-Host "   SUCCESS: Machine joined domain"
    Write-Host ""
    Write-Host "========================================"
    Write-Host "NEXT STEPS (from your Linux machine):"
    Write-Host "========================================"
    Write-Host ""
    Write-Host "1. Create users.txt file on Linux:"
    Write-Host "   Format: username password (one per line)"
    Write-Host "   Example: 601-20 felicidad"
    Write-Host ""
    Write-Host "2. Run profile creation script:"
    Write-Host "   ./create_profiles.sh SAMDOM maquina ./users.txt"
    Write-Host ""
    Write-Host "Note: The users.txt file stays on Linux."
    Write-Host "The script will process it and create users on Windows remotely."
    Write-Host ""
    exit 0
}
catch {
    Write-Host "ERROR joining domain: $($_.Exception.Message)"
    exit 1
}
