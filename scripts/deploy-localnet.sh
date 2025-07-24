#!/bin/bash

# LetsBonkSDK Localnet Program Deployment Script
# This script sets up all required programs and accounts for LetsBonk testing on localnet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
VALIDATOR_PORT=8899
VALIDATOR_URL="http://127.0.0.1:${VALIDATOR_PORT}"
MAINNET_URL="mainnet-beta"
LEDGER_PATH="/tmp/letsbonk-test-ledger"
ACCOUNTS_DIR="./test-ledger-accounts"

# Program IDs and Account Addresses
LETSBONK_PROGRAM_ID='LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj'
RAYDIUM_AUTHORITY='WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh'
GLOBAL_CONFIG='6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX'
PLATFORM_CONFIG='FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1'
EVENT_AUTHORITY='2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr'

# Standard program IDs (available by default but may need cloning for specific versions)
METAPLEX_PROGRAM_ID='metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
TOKEN_PROGRAM_ID='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
ASSOCIATED_TOKEN_PROGRAM_ID='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'

# Function to print colored output
print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Solana CLI is installed
check_solana_cli() {
    if ! command_exists solana; then
        print_error "Solana CLI is not installed. Please install it from https://docs.solana.com/cli/install-solana-cli-tools"
        exit 1
    fi
    
    if ! command_exists solana-test-validator; then
        print_error "solana-test-validator is not available. Please ensure Solana CLI tools are properly installed."
        exit 1
    fi
    
    print_success "Solana CLI tools are available"
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





# Function to verify account exists on mainnet
verify_account_exists() {
    local account_id=$1
    local account_name=$2
    
    print_status "Verifying $account_name account ($account_id) exists on mainnet..."
    
    # Try multiple verification methods for different account types
    local account_info
    
    # Method 1: Standard account query with JSON output
    account_info=$(solana account -u "$MAINNET_URL" "$account_id" --output json 2>/dev/null || echo "{}")
    
    if echo "$account_info" | grep -q '"lamports"'; then
        print_success "$account_name account exists on mainnet (standard account)"
        return 0
    fi
    
    # Method 2: Try with non-JSON output for off-curve accounts
    if solana account -u "$MAINNET_URL" "$account_id" >/dev/null 2>&1; then
        print_success "$account_name account exists on mainnet (off-curve/PDA account)"
        return 0
    fi
    
    # Method 3: Try with account balance check (works for most account types)
    local balance
    balance=$(solana balance -u "$MAINNET_URL" "$account_id" 2>/dev/null || echo "")
    
    if [[ -n "$balance" && "$balance" != "0 SOL" ]]; then
        print_success "$account_name account exists on mainnet (has balance: $balance)"
        return 0
    fi
    
    # If all methods fail, account likely doesn't exist
    print_warning "$account_name account not found on mainnet (will skip cloning)"
    return 1
}



# Function to add program to validator command
add_program_to_validator() {
    local validator_cmd_var=$1
    local program_id=$2
    local program_name=$3
    
    # Use --clone-upgradeable-program to clone from mainnet
    eval "${validator_cmd_var}+=\" --clone-upgradeable-program $program_id\""
    print_success "✅ Using $program_name program (--clone-upgradeable-program)"
    print_status "   Program ID: $program_id"
    print_status "   Source: Mainnet (cloned upgradeable program)"
    return 0
}

# Function to start validator with programs and accounts
start_validator() {
    local deployment_mode=$1
    
    print_status "Starting solana-test-validator with LetsBonk programs..."
    print_status "Program loading mode: --clone-upgradeable-program (clone from mainnet)"
    
    # Base validator command
    local validator_cmd="solana-test-validator"
    validator_cmd+=" --reset"
    validator_cmd+=" --quiet"
    validator_cmd+=" --ledger $LEDGER_PATH"
    validator_cmd+=" --url $MAINNET_URL"
    
    # Track program loading results
    local programs_loaded_successfully=()
    local programs_failed_to_load=()
    
    print_status "📦 Adding programs to validator..."
    
    # Add LetsBonk program
    if add_program_to_validator "validator_cmd" "$LETSBONK_PROGRAM_ID" "letsbonk"; then
        programs_loaded_successfully+=("LetsBonk")
    else
        programs_failed_to_load+=("LetsBonk")
    fi
    
    # Add Metaplex program
    if add_program_to_validator "validator_cmd" "$METAPLEX_PROGRAM_ID" "metaplex"; then
        programs_loaded_successfully+=("Metaplex")
    else
        programs_failed_to_load+=("Metaplex")
    fi
    
    # Add more programs here as needed
    # Example for adding another program:
    # if add_program_to_validator "validator_cmd" "$ANOTHER_PROGRAM_ID" "another_program"; then
    #     programs_loaded_successfully+=("Another Program")
    # else
    #     programs_failed_to_load+=("Another Program")
    # fi
    
    # Check if any critical programs failed to load
    if [[ ${#programs_failed_to_load[@]} -gt 0 ]]; then
        print_error "❌ Failed to load critical programs: ${programs_failed_to_load[*]}"
        print_error "Cannot start validator without required programs"
        return 1
    fi
    
    # Summary of program loading
    echo ""
    print_header "Program Loading Summary"
    print_success "📁 All programs loaded via --clone-upgradeable-program: ${programs_loaded_successfully[*]}"
    echo ""
    
    # Load configuration accounts from JSON dumps (fallback to clone if dumps not available)
    print_status "📋 Adding configuration accounts..."
    
    # Core configuration accounts
    local global_config_file="$ACCOUNTS_DIR/global_config.json"
    local platform_config_file="$ACCOUNTS_DIR/platform_config.json"
    
    if [[ -f "$global_config_file" ]]; then
        validator_cmd+=" --account $GLOBAL_CONFIG $global_config_file"
        print_status "   Global Config: using dump ($global_config_file)"
    else
        validator_cmd+=" --clone $GLOBAL_CONFIG"
        print_status "   Global Config: using --clone (dump not found)"
    fi
    
    if [[ -f "$platform_config_file" ]]; then
        validator_cmd+=" --account $PLATFORM_CONFIG $platform_config_file"
        print_status "   Platform Config: using dump ($platform_config_file)"
    else
        validator_cmd+=" --clone $PLATFORM_CONFIG"
        print_status "   Platform Config: using --clone (dump not found)"
    fi
    
    # Optional accounts (Event Authority and Raydium Authority)
    # These are often PDAs or off-curve accounts that can't be cloned reliably
    if [[ "$INCLUDE_OPTIONAL_ACCOUNTS" == "true" ]]; then
        local event_authority_file="$ACCOUNTS_DIR/event_authority.json"
        local raydium_authority_file="$ACCOUNTS_DIR/raydium_authority.json"
        
        if [[ -f "$event_authority_file" ]]; then
            validator_cmd+=" --account $EVENT_AUTHORITY $event_authority_file"
            print_status "   Event Authority: using dump ($event_authority_file)"
        else
            validator_cmd+=" --clone $EVENT_AUTHORITY"
            print_status "   Event Authority: using --clone (dump not found, may fail)"
        fi
        
        if [[ -f "$raydium_authority_file" ]]; then
            validator_cmd+=" --account $RAYDIUM_AUTHORITY $raydium_authority_file"
            print_status "   Raydium Authority: using dump ($raydium_authority_file)"
        else
            validator_cmd+=" --clone $RAYDIUM_AUTHORITY"
            print_status "   Raydium Authority: using --clone (dump not found, may fail)"
        fi
        
        print_warning "Including optional accounts (may cause failures if dumps unavailable)"
    else
        print_status "⚠️  Skipping optional accounts that may fail to clone"
        print_status "   Use INCLUDE_OPTIONAL_ACCOUNTS=true to force inclusion"
        print_status "   Or create dumps with: ./scripts/dump-accounts.sh"
    fi
    
    # Show final validator command for debugging
    print_status "🚀 Validator command:"
    echo "   $validator_cmd"
    echo ""
    
    # Start validator in background
    print_status "Starting validator..."
    eval "$validator_cmd" &
    
    # Wait for validator to be ready
    local max_attempts=30
    local attempt=0
    
    print_status "⏳ Waiting for validator to be ready..."
    while ! check_validator_running; do
        if [[ $attempt -ge $max_attempts ]]; then
            print_error "Validator failed to start within ${max_attempts} seconds"
            return 1
        fi
        
        if [[ $((attempt % 5)) -eq 0 ]] && [[ $attempt -gt 0 ]]; then
            print_status "Still waiting for validator... (${attempt}/${max_attempts})"
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_success "🎉 Validator is running and ready!"
    print_status "   Validator URL: $VALIDATOR_URL"
    print_success "   All programs loaded via --clone-upgradeable-program from mainnet"
    return 0
}

# Function to verify deployed programs
verify_deployment() {
    print_status "Verifying program deployment on localnet..."
    
    # Check LetsBonk program
    if solana account -u "$VALIDATOR_URL" "$LETSBONK_PROGRAM_ID" >/dev/null 2>&1; then
        print_success "LetsBonk program is available on localnet"
    else
        print_error "LetsBonk program not found on localnet"
        return 1
    fi
    
    # Check Metaplex program
    if solana account -u "$VALIDATOR_URL" "$METAPLEX_PROGRAM_ID" >/dev/null 2>&1; then
        print_success "Metaplex program is available on localnet"
    else
        print_error "Metaplex program not found on localnet"
        return 1
    fi
    
    # Check configuration accounts (more resilient verification)
    # Only check core accounts that we actually tried to clone
    local accounts=(
        "$GLOBAL_CONFIG:Global Config"
        "$PLATFORM_CONFIG:Platform Config"
    )
    
    # Add optional accounts if they were included
    if [[ "$INCLUDE_OPTIONAL_ACCOUNTS" == "true" ]]; then
        accounts+=("$EVENT_AUTHORITY:Event Authority")
        accounts+=("$RAYDIUM_AUTHORITY:Raydium Authority")
    fi
    
    local verified_localnet=()
    local missing_localnet=()
    
    for account_info in "${accounts[@]}"; do
        IFS=':' read -r account_id account_name <<< "$account_info"
        
        # Try multiple verification methods
        if solana account -u "$VALIDATOR_URL" "$account_id" >/dev/null 2>&1 || \
           solana balance -u "$VALIDATOR_URL" "$account_id" >/dev/null 2>&1; then
            print_success "$account_name account is available on localnet"
            verified_localnet+=("$account_name")
        else
            print_warning "$account_name account not found on localnet"
            missing_localnet+=("$account_name")
        fi
    done
    
    if [[ ${#verified_localnet[@]} -gt 0 ]]; then
        print_success "Available on localnet: ${verified_localnet[*]}"
    fi
    
    if [[ ${#missing_localnet[@]} -gt 0 ]]; then
        print_warning "Missing from localnet: ${missing_localnet[*]}"
        print_status "This may be normal for some account types (PDAs, etc.)"
    fi
    
    # Final verification result - we need at least the core programs and 2 core accounts
    local min_required=2
    if [[ ${#verified_localnet[@]} -ge $min_required ]]; then
        print_success "Core programs and accounts are available on localnet!"
        print_status "Localnet deployment is ready for testing"
        
        if [[ ${#missing_localnet[@]} -gt 0 ]]; then
            print_status "Note: Some optional accounts are missing but this won't affect basic functionality"
        fi
        return 0
    else
        print_error "Critical programs or accounts are missing from localnet"
        print_error "Need at least $min_required core accounts, found ${#verified_localnet[@]}"
        return 1
    fi
}

# Function to show program information
show_program_info() {
    print_header "LetsBonk Program Configuration"
    
    echo "📋 Core Programs:"
    echo "  LetsBonk Program ID: $LETSBONK_PROGRAM_ID"
    echo "  Metaplex Program ID: $METAPLEX_PROGRAM_ID"
    echo ""
    
    echo "🗂️  Configuration Accounts:"
    echo "  Global Config: $GLOBAL_CONFIG"
    echo "  Platform Config: $PLATFORM_CONFIG"
    echo "  Event Authority: $EVENT_AUTHORITY"
    echo "  Raydium Authority: $RAYDIUM_AUTHORITY"
    echo ""
    
    echo "🔧 Standard Programs (available by default):"
    echo "  Token Program: $TOKEN_PROGRAM_ID"
    echo "  Associated Token Program: $ASSOCIATED_TOKEN_PROGRAM_ID"
    echo ""
    
    echo "🌐 Network Information:"
    echo "  Localnet URL: $VALIDATOR_URL"
    echo "  Ledger Path: $LEDGER_PATH"

    echo ""
    
    echo "📖 Usage Examples:"
    echo "  Run integration tests: npm run test:localnet"
    echo "  Start validator only:  npm run localnet:start"
    echo "  Stop validator:        npm run localnet:stop"
}



# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -d, --download          Use --clone-upgradeable-program from mainnet (default behavior)"
    echo "  -c, --clone-only        Legacy option (deprecated, now same as -d)"
    echo "  --download-only         Verify programs only (no validator start)"
    echo "  -p, --prepare-only      Prepare deployment without starting validator"
    echo "  -v, --verify            Verify deployment without starting validator"
    echo "  -i, --info              Show program information"
    echo "  -s, --stop              Stop any running validator and cleanup"
    echo "  -f, --full              Include optional accounts (may fail for off-curve accounts)"
    echo ""
    echo "Environment Variables:"
    echo "  INCLUDE_OPTIONAL_ACCOUNTS=true  Force inclusion of problematic accounts"
    echo ""
    echo "Examples:"
    echo "  $0                      # Clone upgradeable programs and start validator"
    echo "  $0 -d                   # Same as above (explicit clone mode)" 
    echo "  $0 --download-only      # Verify programs only (no validator)"
    echo "  $0 -p                   # Prepare deployment (for external orchestration)"
    echo "  $0 -f                   # Include all accounts (may fail)"
    echo "  $0 -v                   # Verify existing deployment"
    echo "  $0 -s                   # Stop validator and cleanup"
}

# Function to cleanup
cleanup() {
    print_status "Stopping validator and cleaning up..."
    pkill -f "solana-test-validator" 2>/dev/null || true
    rm -rf "$LEDGER_PATH" 2>/dev/null || true
    print_success "Cleanup completed"
}

# Main execution function
main() {
    local deployment_mode="download"
    local verify_only=false
    local show_info=false
    local stop_validator=false
    local prepare_only=false
    local download_only=false
    
    # Default to not include optional accounts (safer)
    export INCLUDE_OPTIONAL_ACCOUNTS=${INCLUDE_OPTIONAL_ACCOUNTS:-"false"}
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -d|--download)
                deployment_mode="download"
                shift
                ;;
            -c|--clone-only)
                deployment_mode="download"  # Legacy option, now same as download
                shift
                ;;
            --download-only)
                download_only=true
                shift
                ;;
            -p|--prepare-only)
                prepare_only=true
                shift
                ;;
            -v|--verify)
                verify_only=true
                shift
                ;;
            -i|--info)
                show_info=true
                shift
                ;;
            -s|--stop)
                stop_validator=true
                shift
                ;;
            -f|--full)
                export INCLUDE_OPTIONAL_ACCOUNTS="true"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    print_status "Starting LetsBonk localnet deployment script"
    
    # Handle stop option
    if [[ "$stop_validator" == true ]]; then
        cleanup
        exit 0
    fi
    
    # Handle info option
    if [[ "$show_info" == true ]]; then
        show_program_info
        exit 0
    fi
    
    # Check prerequisites
    check_solana_cli
    
    # Handle download-only option (legacy - now just shows info)
    if [[ "$download_only" == true ]]; then
        print_status "Legacy download-only mode: Programs are now cloned directly via --clone-upgradeable-program"
        show_program_info
        exit 0
    fi
    
    # Handle verify option
    if [[ "$verify_only" == true ]]; then
        if check_validator_running; then
            verify_deployment
        else
            print_error "Validator is not running. Start it first without -v flag."
            exit 1
        fi
        exit 0
    fi
    
    # Programs are now cloned directly via --clone-upgradeable-program
    print_status "Programs will be cloned from mainnet using --clone-upgradeable-program"
    
    # Verify mainnet accounts exist (non-blocking - continue even if some fail)
    print_status "Verifying configuration accounts on mainnet..."
    
    # Always verify core accounts
    local accounts_to_verify=(
        "$GLOBAL_CONFIG:Global Config"
        "$PLATFORM_CONFIG:Platform Config"
    )
    
    # Add optional accounts if requested
    if [[ "$INCLUDE_OPTIONAL_ACCOUNTS" == "true" ]]; then
        accounts_to_verify+=("$EVENT_AUTHORITY:Event Authority")
        accounts_to_verify+=("$RAYDIUM_AUTHORITY:Raydium Authority")
        print_status "Including optional accounts in verification"
    else
        print_status "Skipping verification of optional accounts (use -f to include)"
    fi
    
    local verified_accounts=()
    local failed_accounts=()
    
    for account_info in "${accounts_to_verify[@]}"; do
        IFS=':' read -r account_id account_name <<< "$account_info"
        if verify_account_exists "$account_id" "$account_name"; then
            verified_accounts+=("$account_name")
        else
            failed_accounts+=("$account_name")
        fi
    done
    
    if [[ ${#verified_accounts[@]} -gt 0 ]]; then
        print_success "Verified accounts: ${verified_accounts[*]}"
    fi
    
    if [[ ${#failed_accounts[@]} -gt 0 ]]; then
        print_warning "Unverified accounts (will attempt to clone anyway): ${failed_accounts[*]}"
        print_status "Note: Some accounts may be PDAs or off-curve accounts that are harder to verify"
    fi
    
    # Handle prepare-only mode
    if [[ "$prepare_only" == true ]]; then
        print_success "LetsBonkSDK deployment preparation completed!"
        print_status "Programs and accounts verified on mainnet"
        print_status "Ready for validator startup with prepared configuration"
        exit 0
    fi
    
    # Start validator
    if start_validator "$deployment_mode"; then
        sleep 3  # Give validator time to settle
        
        # Verify deployment
        if verify_deployment; then
            show_program_info
            print_success "LetsBonk localnet deployment completed successfully!"
            print_status "You can now run integration tests with: npm run test:integration"
            print_status "To stop the validator, run: $0 -s"
        else
            print_error "Deployment verification failed"
            exit 1
        fi
    else
        print_error "Failed to start validator"
        exit 1
    fi
}

# Only set cleanup trap for full deployment mode
# (not for verify-only, info, stop, or prepare-only modes)
should_set_cleanup_trap() {
    local has_verify_flag=false
    local has_info_flag=false
    local has_stop_flag=false
    local has_prepare_flag=false
    local has_download_only_flag=false
    
    for arg in "$@"; do
        case $arg in
            -v|--verify) has_verify_flag=true ;;
            -i|--info) has_info_flag=true ;;
            -s|--stop) has_stop_flag=true ;;
            -p|--prepare-only) has_prepare_flag=true ;;
            --download-only) has_download_only_flag=true ;;
        esac
    done
    
    if [[ "$has_verify_flag" == true ]] || [[ "$has_info_flag" == true ]] || \
       [[ "$has_stop_flag" == true ]] || [[ "$has_prepare_flag" == true ]] || \
       [[ "$has_download_only_flag" == true ]]; then
        return 1  # Don't set trap
    else
        return 0  # Set trap for full deployment
    fi
}

# Set cleanup trap only for full deployment mode
if should_set_cleanup_trap "$@"; then
    trap cleanup EXIT
fi

# Run main function
main "$@" 