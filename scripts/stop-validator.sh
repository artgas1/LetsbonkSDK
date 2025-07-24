#!/bin/bash

# LetsBonkSDK Validator Stop Script
# This script stops solana-test-validator and cleans up the test ledger

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VALIDATOR_URL="http://127.0.0.1:8899"
LEDGER_PATH="/tmp/letsbonk-test-ledger"

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
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

# Function to stop validator
stop_validator() {
    local force=${1:-"false"}
    
    print_status "Stopping solana-test-validator..."
    
    # Check if validator is running
    if ! check_validator_running; then
        print_warning "Validator is not currently running at $VALIDATOR_URL"
        return 0
    fi
    
    # Kill the validator process
    local pids
    pids=$(pgrep -f "solana-test-validator" 2>/dev/null || echo "")
    
    if [[ -n "$pids" ]]; then
        print_status "Found validator process(es): $pids"
        
        if [[ "$force" == "true" ]]; then
            print_status "Force killing validator process(es)..."
            kill -9 $pids 2>/dev/null || true
        else
            print_status "Gracefully stopping validator process(es)..."
            kill -TERM $pids 2>/dev/null || true
            
            # Wait a bit for graceful shutdown
            sleep 3
            
            # Check if still running and force kill if needed
            local remaining_pids
            remaining_pids=$(pgrep -f "solana-test-validator" 2>/dev/null || echo "")
            if [[ -n "$remaining_pids" ]]; then
                print_status "Force killing remaining process(es): $remaining_pids"
                kill -9 $remaining_pids 2>/dev/null || true
            fi
        fi
        
        # Wait a moment for cleanup
        sleep 2
        
        # Verify validator is stopped
        if check_validator_running; then
            print_error "Validator is still running after stop attempt"
            return 1
        else
            print_success "Validator stopped successfully"
        fi
    else
        print_warning "No validator process found, but RPC was responding"
    fi
    
    return 0
}

# Function to cleanup ledger
cleanup_ledger() {
    local force=${1:-"false"}
    
    if [[ -d "$LEDGER_PATH" ]]; then
        if [[ "$force" == "true" ]]; then
            print_status "Force cleaning up ledger directory: $LEDGER_PATH"
            rm -rf "$LEDGER_PATH" 2>/dev/null || true
        else
            print_status "Cleaning up ledger directory: $LEDGER_PATH"
            rm -rf "$LEDGER_PATH" 2>/dev/null || {
                print_warning "Could not remove ledger directory. You may need to run with -f flag."
                return 1
            }
        fi
        print_success "Ledger directory cleaned up"
    else
        print_status "Ledger directory does not exist: $LEDGER_PATH"
    fi
    
    return 0
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -f, --force             Force kill and cleanup"
    echo "  -c, --cleanup-only      Only cleanup ledger, don't stop validator"
    echo "  -s, --stop-only         Only stop validator, don't cleanup ledger"
    echo ""
    echo "Examples:"
    echo "  $0                      # Stop validator and cleanup ledger"
    echo "  $0 -f                   # Force stop and cleanup"
    echo "  $0 -c                   # Only cleanup ledger"
    echo "  $0 -s                   # Only stop validator"
}

# Main function
main() {
    local force="false"
    local cleanup_only="false"
    local stop_only="false"
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -f|--force)
                force="true"
                shift
                ;;
            -c|--cleanup-only)
                cleanup_only="true"
                shift
                ;;
            -s|--stop-only)
                stop_only="true"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    
    # Validate conflicting options
    if [[ "$cleanup_only" == "true" && "$stop_only" == "true" ]]; then
        print_error "Cannot specify both --cleanup-only and --stop-only"
        exit 1
    fi
    
    print_status "LetsBonk Validator Stop Script"
    
    # Execute based on options
    if [[ "$cleanup_only" == "true" ]]; then
        cleanup_ledger "$force"
    elif [[ "$stop_only" == "true" ]]; then
        stop_validator "$force"
    else
        # Default: stop validator and cleanup
        stop_validator "$force"
        cleanup_ledger "$force"
    fi
    
    print_success "Operation completed successfully!"
}

# Run main function
main "$@" 