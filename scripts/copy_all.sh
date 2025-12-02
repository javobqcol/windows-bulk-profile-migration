#!/bin/bash
# copy_all.sh
# Copy all migration scripts to remote Windows machine
# Usage: ./copy_all.sh [MACHINE] [USER] [PASSWORD]

MACHINE="$1"
USER="${2:-administrator}"
PASSWORD="$3"
REMOTE_PATH="C:/Windows/Temp"

if [[ -z "$MACHINE" ]]; then
    echo "Usage: $0 machine [user] [password]"
    echo "Example: $0 client-pc01.local administrator password123"
    exit 1
fi

if [[ -z "$PASSWORD" ]]; then
    echo -n "Password for $USER@$MACHINE: "
    read -s PASSWORD
    echo ""
fi

echo "=== Copying files to $MACHINE ==="
echo "User: $USER"
echo "Remote path: $REMOTE_PATH"
echo ""

# List of files to copy
FILES=(
    "configure_openssh.ps1"
    "join_domain.ps1"
    "migrate_data.ps1"
)

COPIED=0
FAILED=0

for file in "${FILES[@]}"; do
    echo -n "-> $file... "
    
    if [[ ! -f "$file" ]]; then
        echo "NOT FOUND"
        ((FAILED++))
        continue
    fi
    
    # Copy file
    if sshpass -p "$PASSWORD" scp \
        -o StrictHostKeyChecking=no \
        "$file" \
        "$USER@$MACHINE:$REMOTE_PATH/" 2>/dev/null; then
        
        echo "copied"
        ((COPIED++))
    else
        echo "failed"
        ((FAILED++))
    fi
done

# Summary
echo ""
echo "=== SUMMARY ==="
echo "Files copied: $COPIED"
echo "Files failed: $FAILED"
echo ""
echo "Remote location: C:\\Windows\\Temp\\"
echo ""
echo "Next command to configure OpenSSH:"
echo "sshpass -p '$PASSWORD' ssh $USER@$MACHINE \\"
echo "  \"powershell -ExecutionPolicy Bypass -File C:\\\\Windows\\\\Temp\\\\configure_openssh.ps1\""
