#!/bin/bash

# LetsBonkSDK Program Status Checker
# This script checks the status of all required programs and accounts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOCALNET_URL="http://127.0.0.1:8899"
MAINNET_URL="mainnet-beta"

# Program IDs and Account Addresses
LETSBONK_PROGRAM_ID='LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj'
RAYDIUM_AUTHORITY='WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh'
GLOBAL_CONFIG='6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX'
PLATFORM_CONFIG='FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1'
EVENT_AUTHORITY='2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr'
METAPLEX_PROGRAM_ID='metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
TOKEN_PROGRAM_ID='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
ASSOCIATED_TOKEN_PROGRAM_ID='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to check if validator is running
check_validator_running() {
    local url=$1
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}' \
        "$url" 2>/dev/null || echo "")
    
    if [[ $response == *"solana-core"* ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check account/program on network
check_account() {
    local url=$1
    local account_id=$2
    local account_name=$3
    local account_type=$4  # "program" or "account"
    
    local account_info
    account_info=$(solana account -u "$url" "$account_id" --output json 2>/dev/null || echo "{}")
    
    if echo "$account_info" | grep -q '"lamports"'; then
        local lamports=$(echo "$account_info" | grep '"lamports"' | cut -d':' -f2 | tr -d ' ,')
        
        if [[ "$account_type" == "program" ]]; then
            # For programs, check if it's executable
            if echo "$account_info" | grep -q '"executable": true'; then
                print_success "$account_name ($account_id) - Program deployed, ${lamports} lamports"
            else
                print_warning "$account_name ($account_id) - Account exists but not executable, ${lamports} lamports"
            fi
        else
            print_success "$account_name ($account_id) - Account exists, ${lamports} lamports"
        fi
        return 0
    else
        print_error "$account_name ($account_id) - Not found"
        return 1
    fi
}

# Function to check all programs and accounts on a network
check_network() {
    local network_name=$1
    local url=$2
    
    echo ""
    echo "=========================================="
    echo "Checking $network_name ($url)"
    echo "=========================================="
    
    # Check if network is reachable
    if ! check_validator_running "$url"; then
        print_error "$network_name is not reachable"
        return 1
    fi
    
    print_success "$network_name is reachable"
    
    # Check programs
    echo ""
    print_status "Programs:"
    check_account "$url" "$LETSBONK_PROGRAM_ID" "LetsBonk Raydium Launchpad" "program"
    check_account "$url" "$METAPLEX_PROGRAM_ID" "Metaplex Token Metadata" "program"
    check_account "$url" "$TOKEN_PROGRAM_ID" "SPL Token Program" "program"
    check_account "$url" "$ASSOCIATED_TOKEN_PROGRAM_ID" "Associated Token Program" "program"
    
    # Check configuration accounts
    echo ""
    print_status "Configuration Accounts:"
    check_account "$url" "$GLOBAL_CONFIG" "Global Config" "account"
    check_account "$url" "$PLATFORM_CONFIG" "Platform Config" "account"
    check_account "$url" "$EVENT_AUTHORITY" "Event Authority" "account"
    check_account "$url" "$RAYDIUM_AUTHORITY" "Raydium Authority" "account"
}

# Function to get detailed account info
get_account_details() {
    local url=$1
    local account_id=$2
    local account_name=$3
    
    echo ""
    echo "=========================================="
    echo "Detailed Info: $account_name"
    echo "=========================================="
    echo "Account ID: $account_id"
    echo "Network: $url"
    echo ""
    
    solana account -u "$url" "$account_id" --output json 2>/dev/null | jq '.' || {
        print_error "Failed to get account details"
    }
}

# Function to show RPC health
show_rpc_health() {
    local url=$1
    local network_name=$2
    
    echo ""
    echo "=========================================="
    echo "$network_name RPC Health"
    echo "=========================================="
    
    # Get version
    local version_response
    version_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}' \
        "$url" 2>/dev/null || echo "")
    
    if [[ $version_response == *"solana-core"* ]]; then
        local version=$(echo "$version_response" | jq -r '.result["solana-core"]' 2>/dev/null || echo "unknown")
        print_success "Solana Core Version: $version"
    else
        print_error "Failed to get version info"
    fi
    
    # Get slot
    local slot_response
    slot_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getSlot"}' \
        "$url" 2>/dev/null || echo "")
    
    if [[ $slot_response == *"result"* ]]; then
        local slot=$(echo "$slot_response" | jq -r '.result' 2>/dev/null || echo "unknown")
        print_success "Current Slot: $slot"
    else
        print_error "Failed to get slot info"
    fi
    
    # Get epoch info
    local epoch_response
    epoch_response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getEpochInfo"}' \
        "$url" 2>/dev/null || echo "")
    
    if [[ $epoch_response == *"result"* ]]; then
        local epoch=$(echo "$epoch_response" | jq -r '.result.epoch' 2>/dev/null || echo "unknown")
        print_success "Current Epoch: $epoch"
    else
        print_error "Failed to get epoch info"
    fi
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -l, --localnet          Check localnet only"
    echo "  -m, --mainnet           Check mainnet only"
    echo "  -a, --all               Check both localnet and mainnet (default)"
    echo "  -d, --details ID        Get detailed info for specific account ID"
    echo "  -r, --rpc-health        Show RPC health information"
    echo ""
    echo "Examples:"
    echo "  $0                      # Check both networks"
    echo "  $0 -l                   # Check localnet only"
    echo "  $0 -m                   # Check mainnet only"
    echo "  $0 -d $LETSBONK_PROGRAM_ID  # Get details for LetsBonk program"
    echo "  $0 -r -l                # Show localnet RPC health"
}

# Main execution
main() {
    local check_localnet=true
    local check_mainnet=true
    local details_account=""
    local show_rpc=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -l|--localnet)
                check_localnet=true
                check_mainnet=false
                shift
                ;;
            -m|--mainnet)
                check_localnet=false
                check_mainnet=true
                shift
                ;;
            -a|--all)
                check_localnet=true
                check_mainnet=true
                shift
                ;;
            -d|--details)
                details_account="$2"
                shift 2
                ;;
            -r|--rpc-health)
                show_rpc=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Handle details request
    if [[ -n "$details_account" ]]; then
        if [[ "$check_localnet" == true ]]; then
            get_account_details "$LOCALNET_URL" "$details_account" "Localnet Account"
        fi
        if [[ "$check_mainnet" == true ]]; then
            get_account_details "$MAINNET_URL" "$details_account" "Mainnet Account"
        fi
        exit 0
    fi
    
    # Handle RPC health request
    if [[ "$show_rpc" == true ]]; then
        if [[ "$check_localnet" == true ]]; then
            show_rpc_health "$LOCALNET_URL" "Localnet"
        fi
        if [[ "$check_mainnet" == true ]]; then
            show_rpc_health "$MAINNET_URL" "Mainnet"
        fi
        exit 0
    fi
    
    print_status "LetsBonkSDK Program Status Checker"
    print_status "Checking programs and accounts required for LetsBonk integration tests"
    
    # Check networks
    if [[ "$check_localnet" == true ]]; then
        check_network "Localnet" "$LOCALNET_URL"
    fi
    
    if [[ "$check_mainnet" == true ]]; then
        check_network "Mainnet" "$MAINNET_URL"
    fi
    
    echo ""
    print_status "Check completed!"
    print_status "Use -h for more options"
}

# Run main function
main "$@" 