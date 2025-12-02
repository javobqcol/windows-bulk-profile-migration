#!/bin/bash
# create_profiles.sh
# Force creation of domain user profiles using SSH
# Usage: ./create_profiles.sh [DOMAIN] [CLIENT_MACHINE] [USER_LIST]
# USER_LIST debe ser un archivo LOCAL en Linux

DOMAIN="${1:-SAMDOM}"
CLIENT_MACHINE="$2"
USER_LIST="$3"

if [[ -z "$CLIENT_MACHINE" ]] || [[ -z "$USER_LIST" ]]; then
    echo "Usage: $0 [DOMAIN] CLIENT_MACHINE USER_LIST"
    echo "Example: $0 SAMDOM inem-23.local ./users.txt"  # Cambié la ruta
    exit 1
fi

echo "=== Creating profiles on $CLIENT_MACHINE ==="
echo "Domain: $DOMAIN"
echo "User list: $USER_LIST (local file on Linux)"  # Agregué aclaración
echo ""

# Verificar que el archivo existe LOCALMENTE
if [[ ! -f "$USER_LIST" ]]; then
    echo "ERROR: User list file '$USER_LIST' not found on local machine"
    echo "Make sure the file exists in your current directory on Linux"
    exit 1
fi

TOTAL=0
SUCCESS=0
FAILED=0

while IFS=' ' read -r USERNAME PASSWORD
do
    [[ -z "$USERNAME" ]] && continue
    ((TOTAL++))
    
    echo "-> [$TOTAL] $DOMAIN\\$USERNAME"
    
    if sshpass -p "$PASSWORD" ssh \
        -o StrictHostKeyChecking=no \
        "$DOMAIN\\$USERNAME@$CLIENT_MACHINE" \
        "exit" </dev/null 2>&1; then
        
        echo "   OK"
        ((SUCCESS++))
    else
        echo "   FAILED"
        ((FAILED++))
    fi

done < "$USER_LIST"  # Lee del archivo LOCAL en Linux

echo ""
echo "=== SUMMARY ==="
echo "Total: $TOTAL | OK: $SUCCESS | Failed: $FAILED"
echo ""
echo "NEXT: Migrate data"
echo "1. Create user_mapping.txt on Linux: local_user domain_user"  # Agregué "on Linux"
echo "   Example: alumno01 601-20"
echo ""
echo "2. Copy to Windows:"
echo "   scp user_mapping.txt estudiante@$CLIENT_MACHINE:C:/Windows/Temp/"
echo ""
echo "3. Run migration:"
echo "   sshpass -p '0lucr4d0n' ssh estudiante@$CLIENT_MACHINE \\"
echo "     \"powershell -ExecutionPolicy Bypass -File C:\\\\Windows\\\\Temp\\\\migrate_data.ps1 \\"
echo "     C:\\\\Windows\\\\Temp\\\\user_mapping.txt $DOMAIN \\"
echo "     Documents,Desktop,Pictures\""
