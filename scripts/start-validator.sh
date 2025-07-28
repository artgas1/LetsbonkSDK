#!/bin/bash

# LetsBonkSDK Validator Startup Script
# This script starts solana-test-validator with the correct LetsBonk configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VALIDATOR_URL="http://127.0.0.1:8899"
MAINNET_URL="mainnet-beta"
LEDGER_PATH="/tmp/letsbonk-test-ledger"
ACCOUNTS_DIR="./test-ledger-accounts"

# Program IDs and Account Addresses
LETSBONK_PROGRAM_ID='LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj'
METAPLEX_PROGRAM_ID='metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
GLOBAL_CONFIG='6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX'
PLATFORM_CONFIG='FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1'
EVENT_AUTHORITY='2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr'
RAYDIUM_AUTHORITY='WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh'
ALT_RAYDIUM_ACCOUNT='AcL1Vo8oy1ULiavEcjSUcwfBSForXMudcZvDZy5nzJkU'

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if validator is running
check_validator_running() {
    local response
    response=$(curl -s -X POST -H "Content-Type: application/json" \
        -d '{"jsonrpc":"2.0","id":1,"method":"getVersion"}' \
        "$VALIDATOR_URL" 2>/dev/null || echo "")
    
    if [[ $response == *"solana-core"* ]]; then
        return 0
    else
        return 1
    fi
}

# Function to start validator
start_validator() {
    local include_optional=${1:-"false"}
    
    print_status "Starting solana-test-validator with LetsBonk configuration (clone-upgradeable-program mode)..."
    
    # Clean up any existing ledger
    rm -rf "$LEDGER_PATH" 2>/dev/null || true
    
    # Base validator command
    local validator_cmd="solana-test-validator"
    validator_cmd+=" --reset"
    validator_cmd+=" --quiet"
    validator_cmd+=" --warp-slot 355653385"
    validator_cmd+=" --ledger $LEDGER_PATH"
    validator_cmd+=" --url $MAINNET_URL"
    
    # Clone upgradeable programs from mainnet
    validator_cmd+=" --clone-upgradeable-program $LETSBONK_PROGRAM_ID"
    validator_cmd+=" --clone-upgradeable-program $METAPLEX_PROGRAM_ID"
    
    # Clone additional account
    validator_cmd+=" --clone $ALT_RAYDIUM_ACCOUNT"
    
    # Load core configuration accounts from JSON dumps
    local global_config_file="$ACCOUNTS_DIR/global_config.json"
    local platform_config_file="$ACCOUNTS_DIR/platform_config.json"
    
    if [[ -f "$global_config_file" ]]; then
        validator_cmd+=" --account $GLOBAL_CONFIG $global_config_file"
        print_status "Using Global Config from dump: $global_config_file"
    else
        validator_cmd+=" --clone $GLOBAL_CONFIG"
        print_warning "Global Config dump not found, using --clone instead"
    fi
    
    if [[ -f "$platform_config_file" ]]; then
        validator_cmd+=" --account $PLATFORM_CONFIG $platform_config_file"
        print_status "Using Platform Config from dump: $platform_config_file"
    else
        validator_cmd+=" --clone $PLATFORM_CONFIG"
        print_warning "Platform Config dump not found, using --clone instead"
    fi
    
    # Include optional accounts if requested
    if [[ "$include_optional" == "true" ]]; then
        local event_authority_file="$ACCOUNTS_DIR/event_authority.json"
        local raydium_authority_file="$ACCOUNTS_DIR/raydium_authority.json"
        
        if [[ -f "$event_authority_file" ]]; then
            validator_cmd+=" --account $EVENT_AUTHORITY $event_authority_file"
            print_status "Using Event Authority from dump: $event_authority_file"
        else
            validator_cmd+=" --clone $EVENT_AUTHORITY"
            print_warning "Event Authority dump not found, using --clone instead"
        fi
        
        if [[ -f "$raydium_authority_file" ]]; then
            validator_cmd+=" --account $RAYDIUM_AUTHORITY $raydium_authority_file"
            print_status "Using Raydium Authority from dump: $raydium_authority_file"
        else
            validator_cmd+=" --clone $RAYDIUM_AUTHORITY"
            print_warning "Raydium Authority dump not found, using --clone instead"
        fi
        
        print_status "Including optional accounts (using dumps when available)"
    else
        print_status "Using account dumps for core accounts only (safer for testing)"
    fi
    
    print_status "Validator command: $validator_cmd"
    
    # Start validator in background
    eval "$validator_cmd" &
    
    return 0
}

# Function to wait for validator readiness
wait_for_validator() {
    local max_attempts=${1:-30}
    local attempt=0
    
    print_status "Waiting for validator to be ready..."
    
    while ! check_validator_running; do
        if [[ $attempt -ge $max_attempts ]]; then
            print_error "Validator failed to start within ${max_attempts} attempts"
            return 1
        fi
        
        print_status "Waiting for validator... (${attempt}/${max_attempts})"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "Validator is ready and responding!"
    return 0
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -f, --full              Include optional accounts (may fail)"
    echo "  -w, --wait SECONDS      Wait timeout (default: 30)"
    echo ""
    echo "Examples:"
    echo "  $0                      # Start with core accounts only"
    echo "  $0 -f                   # Start with all accounts"
    echo "  $0 -w 60                # Wait up to 60 seconds for startup"
}

# Main function
main() {
    local include_optional="false"
    local wait_timeout=30
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -f|--full)
                include_optional="true"
                shift
                ;;
            -w|--wait)
                wait_timeout="$2"
                shift 2
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Check if validator is already running
    if check_validator_running; then
        print_error "Validator is already running at $VALIDATOR_URL"
        print_status "Stop it first with: pkill -f solana-test-validator"
        exit 1
    fi
    
    # Start validator
    if start_validator "$include_optional"; then
        if wait_for_validator "$wait_timeout"; then
            print_success "LetsBonk validator started successfully!"
            print_status "Validator URL: $VALIDATOR_URL"
            print_status "Ledger path: $LEDGER_PATH"
        else
            print_error "Validator startup failed or timed out"
            exit 1
        fi
    else
        print_error "Failed to start validator"
        exit 1
    fi
}

# Run main function
main "$@" 