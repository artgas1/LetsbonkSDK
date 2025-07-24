#!/bin/bash

# LetsBonkSDK Account Dumping Script
# This script dumps account data from mainnet for local testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAINNET_URL="mainnet-beta"
ACCOUNTS_DIR="./test-ledger-accounts"

# Account Addresses (non-programs)
GLOBAL_CONFIG='6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX'
PLATFORM_CONFIG='FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1'
EVENT_AUTHORITY='2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr'
RAYDIUM_AUTHORITY='WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to dump account
dump_account() {
    local account_address=$1
    local account_name=$2
    local output_file="${ACCOUNTS_DIR}/${account_name}.json"
    
    print_status "Dumping $account_name account ($account_address)..."
    
    # Try to dump the account
    if solana account "$account_address" --url "$MAINNET_URL" --output json > "$output_file" 2>/dev/null; then
        # Verify the file was created and has content
        if [[ -s "$output_file" ]]; then
            print_success "✅ $account_name account dumped successfully"
            print_status "   File: $output_file"
            print_status "   Size: $(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file" 2>/dev/null || echo "unknown") bytes"
        else
            print_error "❌ $account_name dump file is empty"
            rm -f "$output_file"
            return 1
        fi
    else
        print_warning "⚠️  Failed to dump $account_name account (may not exist or be accessible)"
        rm -f "$output_file" 2>/dev/null || true
        return 1
    fi
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -f, --force             Force re-dump existing files"
    echo "  -c, --check             Check existing dumps without re-dumping"
    echo ""
    echo "Examples:"
    echo "  $0                      # Dump all accounts"
    echo "  $0 -f                   # Force re-dump all accounts"
    echo "  $0 -c                   # Check existing dumps"
}

# Function to check existing dumps
check_dumps() {
    print_status "Checking existing account dumps..."
    
    local dumps_found=0
    local dumps_valid=0
    
    for account_name in "global_config" "platform_config" "event_authority" "raydium_authority"; do
        local dump_file="${ACCOUNTS_DIR}/${account_name}.json"
        if [[ -f "$dump_file" ]]; then
            dumps_found=$((dumps_found + 1))
            if [[ -s "$dump_file" ]]; then
                dumps_valid=$((dumps_valid + 1))
                print_success "✅ $account_name.json exists and has content"
            else
                print_warning "⚠️  $account_name.json exists but is empty"
            fi
        else
            print_warning "⚠️  $account_name.json not found"
        fi
    done
    
    print_status "Summary: $dumps_valid valid dumps out of $dumps_found found files"
}

# Main function
main() {
    local force_dump="false"
    local check_only="false"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -f|--force)
                force_dump="true"
                shift
                ;;
            -c|--check)
                check_only="true"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Create accounts directory
    mkdir -p "$ACCOUNTS_DIR"
    
    # If check only, just check and exit
    if [[ "$check_only" == "true" ]]; then
        check_dumps
        exit 0
    fi
    
    print_status "Dumping LetsBonk configuration accounts from mainnet..."
    print_status "Target directory: $ACCOUNTS_DIR"
    print_status "Source: $MAINNET_URL"
    echo ""
    
    # Track results
    local successful_dumps=0
    local failed_dumps=0
    
    # Dump each account
    local accounts=(
        "$GLOBAL_CONFIG:global_config"
        "$PLATFORM_CONFIG:platform_config"
        "$EVENT_AUTHORITY:event_authority"
        "$RAYDIUM_AUTHORITY:raydium_authority"
    )
    
    for account_info in "${accounts[@]}"; do
        IFS=':' read -r account_address account_name <<< "$account_info"
        local output_file="${ACCOUNTS_DIR}/${account_name}.json"
        
        # Skip if file exists and force is not set
        if [[ -f "$output_file" && "$force_dump" != "true" ]]; then
            print_status "⏭️  Skipping $account_name (file exists, use -f to force)"
            continue
        fi
        
        if dump_account "$account_address" "$account_name"; then
            successful_dumps=$((successful_dumps + 1))
        else
            failed_dumps=$((failed_dumps + 1))
        fi
        echo ""
    done
    
    # Summary
    echo ""
    print_status "=== ACCOUNT DUMPING SUMMARY ==="
    print_success "✅ Successful dumps: $successful_dumps"
    
    if [[ $failed_dumps -gt 0 ]]; then
        print_warning "⚠️  Failed dumps: $failed_dumps"
    fi
    
    if [[ $successful_dumps -gt 0 ]]; then
        print_success "Account dumps saved to: $ACCOUNTS_DIR"
        print_status "You can now use these with --account flag in solana-test-validator"
    fi
}

# Run main function
main "$@" 