#!/bin/bash
# create_profiles.sh
# Force creation of domain user profiles using SSH
# Usage: ./create_profiles.sh [DOMAIN] [CLIENT_MACHINE] [USER_LIST]

# Default values
DOMAIN_DEFAULT="SAMDOM"
CLIENT_MACHINE_DEFAULT="client-pc01"
USER_LIST_DEFAULT="users.txt"

# Assign parameters or use defaults
DOMAIN="${1:-$DOMAIN_DEFAULT}"
CLIENT_MACHINE="${2:-$CLIENT_MACHINE_DEFAULT}"
USER_LIST="${3:-$USER_LIST_DEFAULT}"

echo "=== Creating profiles on $CLIENT_MACHINE ==="
echo "Domain: $DOMAIN"
echo "User list: $USER_LIST"
echo ""

TOTAL=0
SUCCESS=0
FAILED=0

# Read user list file
while IFS=' ' read -r USERNAME PASSWORD
do
    [[ -z "$USERNAME" ]] && continue
    ((TOTAL++))
    
    echo "-> [$TOTAL] Testing: $DOMAIN\\$USERNAME"
    
    # SSH authentication (ghost technique)
    if sshpass -p "$PASSWORD" ssh \
        -o StrictHostKeyChecking=no \
        -o ConnectTimeout=10 \
        "$DOMAIN\\$USERNAME@$CLIENT_MACHINE" \
        "exit" </dev/null 2>&1; then
        
        echo "   SSH successful -> Profile created"
        ((SUCCESS++))
    else
        echo "   SSH failed -> Profile not created"
        ((FAILED++))
    fi
    
    echo ""

done < "$USER_LIST"

# Summary
echo "=== SUMMARY ==="
echo "Total users processed: $TOTAL"
echo "Successful: $SUCCESS"
echo "Failed: $FAILED"
echo ""
echo "Note: Each successful SSH creates user profile in Windows"
echo "      Profiles at: C:\\Users\\$USERNAME.$DOMAIN"
