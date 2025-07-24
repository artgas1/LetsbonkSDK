#!/bin/bash

# LetsBonkSDK Integration Testing Orchestration Script
# Complete automated flow: deploy localnet -> run tests -> cleanup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VALIDATOR_URL="http://127.0.0.1:8899"
TEST_TIMEOUT=300  # 5 minutes for all tests
STARTUP_TIMEOUT=60  # 1 minute for validator startup

# Test results
TEST_RESULTS_FILE="/tmp/letsbonk-test-results.json"
TEST_LOG_FILE="/tmp/letsbonk-test.log"

# Function to print colored output
print_header() {
    echo -e "${PURPLE}[ORCHESTRATOR]${NC} $1"
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

print_step() {
    echo -e "${PURPLE}[STEP $1]${NC} $2"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Integration Testing Orchestration Script"
    echo "Runs complete automated flow: deploy -> test -> cleanup"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -u, --unit-first        Run unit tests before integration tests"
    echo "  -s, --skip-unit         Skip unit tests, run integration only"
    echo "  -c, --coverage          Run tests with coverage reporting"
    echo "  -v, --verbose           Verbose test output"
    echo "  -k, --keep-running      Keep validator running after tests"
    echo "  -t, --timeout SECONDS   Test timeout (default: $TEST_TIMEOUT)"
    echo "  --dry-run               Show what would be executed without running"
    echo ""
    echo "Examples:"
    echo "  $0                      # Full test cycle with cleanup"
    echo "  $0 -u                   # Run unit tests first"
    echo "  $0 -s -v                # Integration tests only, verbose"
    echo "  $0 -c                   # Run tests with coverage"
    echo "  $0 -k                   # Keep validator running after tests"
    echo "  $0 --dry-run            # Preview actions without execution"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "1" "Checking prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        print_error "Not in LetsBonkSDK project directory"
        return 1
    fi
    
    # Check Node.js and npm
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        return 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        return 1
    fi
    
    # Check Solana CLI
    if ! command -v solana >/dev/null 2>&1; then
        print_error "Solana CLI is not installed"
        return 1
    fi
    
    if ! command -v solana-test-validator >/dev/null 2>&1; then
        print_error "solana-test-validator is not available"
        return 1
    fi
    
    print_success "All prerequisites satisfied"
    
    # Show versions
    print_status "Node.js: $(node --version)"
    print_status "npm: $(npm --version)"
    print_status "Solana CLI: $(solana --version | head -1)"
    
    return 0
}







# Function to cleanup any existing processes
cleanup_existing() {
    print_step "2" "Cleaning up existing processes and files"
    
    # Kill any existing validators
    if pgrep -f "solana-test-validator" >/dev/null; then
        print_status "Stopping existing solana-test-validator processes"
        pkill -f "solana-test-validator" || true
        sleep 2
    fi
    
    # Clean up temporary files
    rm -f "$TEST_RESULTS_FILE" "$TEST_LOG_FILE"
    
    # Clean up ledger directory
    rm -rf /tmp/letsbonk-test-ledger
    
    # Cache cleaning no longer needed (programs cloned directly)
    
    print_success "Cleanup completed"
}

# Function to deploy localnet
deploy_localnet() {
    local deployment_mode=$1
    print_step "3" "Preparing LetsBonk programs for localnet"
    
    # Using --clone-upgradeable-program mode (no local binaries needed)
    print_status "Programs will be cloned from mainnet using --clone-upgradeable-program"
    print_status "No local program binaries required for --clone-upgradeable-program mode"
    
    # Run deployment preparation with clone mode
    local deploy_args="-p -d"
    print_status "Using --clone-upgradeable-program mode to clone from mainnet"
    
    if ! "$SCRIPT_DIR/deploy-localnet.sh" $deploy_args; then
        print_error "Failed to prepare localnet deployment"
        return 1
    fi
    
    print_success "Localnet deployment preparation completed"
    print_success "All programs ready for --clone-upgradeable-program loading"
    return 0
}

# Function to start and wait for validator
start_and_wait_for_validator() {
    print_step "4" "Starting validator and waiting for readiness"
    
    # Start validator using dedicated script
    local validator_args=""
    if [[ "$INCLUDE_OPTIONAL_ACCOUNTS" == "true" ]]; then
        validator_args="-f"
        print_status "Starting validator with all accounts"
    else
        print_status "Starting validator with core accounts only"
    fi
    
    # Start validator
    if ! "$SCRIPT_DIR/start-validator.sh" $validator_args -w $((STARTUP_TIMEOUT / 2)); then
        print_error "Failed to start validator"
        return 1
    fi
    
    print_success "Validator is ready and LetsBonk programs are accessible"
    return 0
}

# Function to verify deployment
verify_deployment() {
    print_step "5" "Verifying program deployment"
    
    if ! "$SCRIPT_DIR/deploy-localnet.sh" -v; then
        print_error "Deployment verification failed"
        return 1
    fi
    
    print_success "All required programs and accounts are available"
    return 0
}

# Function to run unit tests
run_unit_tests() {
    print_step "6" "Running unit tests"
    
    cd "$PROJECT_ROOT"
    
    local test_cmd="npm run test:unit"
    if [[ "$ENABLE_COVERAGE" == "true" ]]; then
        test_cmd="npm run test:coverage -- --selectProjects='Unit Tests'"
    fi
    
    if [[ "$VERBOSE_OUTPUT" == "true" ]]; then
        test_cmd="$test_cmd -- --verbose"
    fi
    
    print_status "Running: $test_cmd"
    
    if eval "$test_cmd"; then
        print_success "Unit tests passed"
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_step "7" "Running integration tests"
    
    cd "$PROJECT_ROOT"
    
    # Set environment variables for integration tests
    export INTEGRATION_TESTS=true
    export SOLANA_RPC_URL="$VALIDATOR_URL"
    
    local test_cmd="npm run test:integration"
    if [[ "$ENABLE_COVERAGE" == "true" ]]; then
        test_cmd="npm run test:coverage -- --selectProjects='Integration Tests'"
    fi
    
    if [[ "$VERBOSE_OUTPUT" == "true" ]]; then
        test_cmd="$test_cmd -- --verbose"
    fi
    
    # Add timeout (compatible with both Linux and macOS)
    if command -v timeout >/dev/null 2>&1; then
        # GNU timeout (Linux)
        test_cmd="timeout ${TEST_TIMEOUT} $test_cmd"
    elif command -v gtimeout >/dev/null 2>&1; then
        # GNU timeout installed via Homebrew (macOS)
        test_cmd="gtimeout ${TEST_TIMEOUT} $test_cmd"
    else
        # No timeout available, just run the command
        print_warning "No timeout command available, running tests without timeout"
    fi
    
    print_status "Running: $test_cmd"
    print_status "Test timeout: ${TEST_TIMEOUT} seconds"
    
    # Run tests and capture output
    local test_exit_code=0
    if ! eval "$test_cmd" 2>&1 | tee "$TEST_LOG_FILE"; then
        test_exit_code=1
    fi
    
    # Generate test results summary
    generate_test_summary $test_exit_code
    
    if [[ $test_exit_code -eq 0 ]]; then
        print_success "Integration tests passed"
        return 0
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Function to generate test summary
generate_test_summary() {
    local exit_code=$1
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Parse test results from log file
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local test_suites=0
    
    if [[ -f "$TEST_LOG_FILE" ]]; then
        # Extract Jest summary information
        total_tests=$(grep -o "Tests:.*passed" "$TEST_LOG_FILE" | tail -1 | grep -o "[0-9]*" | head -1 || echo "0")
        passed_tests=$(grep -o "[0-9]* passed" "$TEST_LOG_FILE" | tail -1 | grep -o "[0-9]*" || echo "0")
        failed_tests=$(grep -o "[0-9]* failed" "$TEST_LOG_FILE" | tail -1 | grep -o "[0-9]*" || echo "0")
        test_suites=$(grep -o "Test Suites:.*passed" "$TEST_LOG_FILE" | tail -1 | grep -o "[0-9]*" | head -1 || echo "0")
    fi
    
    # Create JSON summary
    cat > "$TEST_RESULTS_FILE" << EOF
{
  "timestamp": "$timestamp",
  "exit_code": $exit_code,
  "status": "$([ $exit_code -eq 0 ] && echo "PASSED" || echo "FAILED")",
  "test_results": {
    "total_tests": $total_tests,
    "passed_tests": $passed_tests,
    "failed_tests": $failed_tests,
    "test_suites": $test_suites
  },
  "environment": {
    "validator_url": "$VALIDATOR_URL",
    "node_version": "$(node --version)",
    "solana_version": "$(solana --version | head -1)"
  },
  "log_file": "$TEST_LOG_FILE"
}
EOF
    
    print_status "Test summary saved to: $TEST_RESULTS_FILE"
}

# Function to show test results
show_test_results() {
    if [[ -f "$TEST_RESULTS_FILE" ]]; then
        print_header "Test Results Summary"
        
        local status=$(jq -r '.status' "$TEST_RESULTS_FILE" 2>/dev/null || echo "UNKNOWN")
        local total=$(jq -r '.test_results.total_tests' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
        local passed=$(jq -r '.test_results.passed_tests' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
        local failed=$(jq -r '.test_results.failed_tests' "$TEST_RESULTS_FILE" 2>/dev/null || echo "0")
        
        echo "  Status: $status"
        echo "  Total Tests: $total"
        echo "  Passed: $passed"
        echo "  Failed: $failed"
        echo "  Results File: $TEST_RESULTS_FILE"
        echo "  Log File: $TEST_LOG_FILE"
    fi
}

# Function to cleanup after tests
cleanup_after_tests() {
    print_step "8" "Cleaning up test environment"
    
    if [[ "$KEEP_RUNNING" != "true" ]]; then
        # Stop validator
        if ! "$SCRIPT_DIR/deploy-localnet.sh" -s; then
            print_warning "Failed to stop validator cleanly, forcing cleanup"
            pkill -f "solana-test-validator" || true
        fi
        
        # Remove ledger directory
        rm -rf /tmp/letsbonk-test-ledger
        
        print_success "Cleanup completed - validator stopped and files removed"
    else
        print_warning "Keeping validator running as requested"
        print_status "Validator URL: $VALIDATOR_URL"
        print_status "To stop later, run: npm run deploy:stop"
    fi
}

# Function for dry run
dry_run() {
    print_header "DRY RUN - Would execute the following steps:"
    echo ""
    print_step "1" "Check prerequisites (Node.js, npm, Solana CLI)"
    print_step "2" "Cleanup existing processes and temporary files"
    
    # Show program preparation strategy
    print_step "2A" "Prepare programs for --clone-upgradeable-program loading"
    print_status "   Programs will be cloned directly from mainnet"
    
    print_step "3" "Deploy LetsBonk programs to localnet (--clone-upgradeable-program mode)"
    print_step "4" "Start validator and wait for readiness (timeout: ${STARTUP_TIMEOUT}s)"
    print_step "5" "Verify program deployment"
    
    if [[ "$RUN_UNIT_TESTS" == "true" ]]; then
        print_step "6" "Run unit tests $([ "$ENABLE_COVERAGE" == "true" ] && echo "(with coverage)" || echo "")"
    fi
    
    if [[ "$SKIP_UNIT_TESTS" != "true" ]]; then
        print_step "7" "Run integration tests (timeout: ${TEST_TIMEOUT}s) $([ "$VERBOSE_OUTPUT" == "true" ] && echo "(verbose)" || echo "")"
    fi
    
    print_step "8" "Cleanup test environment $([ "$KEEP_RUNNING" == "true" ] && echo "(keep validator running)" || echo "(stop validator)")"
    
    echo ""
    print_status "Configuration:"
    print_status "  Program Loading: --clone-upgradeable-program (clone from mainnet)"
    print_status "  Coverage: $ENABLE_COVERAGE"
    print_status "  Verbose: $VERBOSE_OUTPUT"
    echo ""
    print_status "Note: Programs are now cloned directly from mainnet using --clone-upgradeable-program."
    print_status "Use without --dry-run to execute"
}

# Main execution function
main() {
    local deployment_mode="clone"
    local run_unit_tests=false
    local skip_unit_tests=false
    local enable_coverage=false
    local verbose_output=false
    local keep_running=false
    local dry_run_mode=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -u|--unit-first)
                run_unit_tests=true
                shift
                ;;
            -s|--skip-unit)
                skip_unit_tests=true
                shift
                ;;

            -c|--coverage)
                enable_coverage=true
                shift
                ;;
            -v|--verbose)
                verbose_output=true
                shift
                ;;
            -k|--keep-running)
                keep_running=true
                shift
                ;;
            -t|--timeout)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            --dry-run)
                dry_run_mode=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
        esac
    done
    

    
    # Export variables for use in functions
    export DEPLOYMENT_MODE="$deployment_mode"
    export RUN_UNIT_TESTS="$run_unit_tests"
    export SKIP_UNIT_TESTS="$skip_unit_tests"
    export ENABLE_COVERAGE="$enable_coverage"
    export VERBOSE_OUTPUT="$verbose_output"
    export KEEP_RUNNING="$keep_running"
    
    # Show configuration
    print_header "LetsBonkSDK Integration Testing Orchestrator"
    print_status "Test timeout: ${TEST_TIMEOUT} seconds"
    print_status "Deployment mode: $deployment_mode (--clone-upgradeable-program)"
    print_status "Unit tests: $([ "$run_unit_tests" == "true" ] && echo "enabled" || echo "$([ "$skip_unit_tests" == "true" ] && echo "skipped" || echo "after integration")")"
    print_status "Coverage: $([ "$enable_coverage" == "true" ] && echo "enabled" || echo "disabled")"
    print_status "Verbose: $([ "$verbose_output" == "true" ] && echo "enabled" || echo "disabled")"
    print_status "Keep running: $([ "$keep_running" == "true" ] && echo "yes" || echo "no")"
    echo ""
    
    # Handle dry run
    if [[ "$dry_run_mode" == "true" ]]; then
        dry_run
        exit 0
    fi
    
    # Start timer
    local start_time=$(date +%s)
    
    # Initialize test results tracking
    local overall_exit_code=0
    
    # Trap to ensure cleanup on exit
    trap 'cleanup_after_tests; exit $overall_exit_code' EXIT INT TERM
    
    # Execute the testing flow
    if ! check_prerequisites; then
        overall_exit_code=1
        exit 1
    fi
    
    if ! cleanup_existing; then
        overall_exit_code=1
        exit 1
    fi
    
    if ! deploy_localnet "$deployment_mode"; then
        overall_exit_code=1
        exit 1
    fi
    
    if ! start_and_wait_for_validator; then
        overall_exit_code=1
        exit 1
    fi
    
    if ! verify_deployment; then
        overall_exit_code=1
        exit 1
    fi
    
    # Run unit tests if requested
    if [[ "$run_unit_tests" == "true" ]]; then
        if ! run_unit_tests; then
            overall_exit_code=1
            print_error "Unit tests failed, stopping execution"
            exit 1
        fi
    fi
    
    # Run integration tests (unless explicitly skipped)
    if [[ "$skip_unit_tests" != "true" ]]; then
        if ! run_integration_tests; then
            overall_exit_code=1
        fi
    fi
    
    # Calculate total time
    local end_time=$(date +%s)
    local total_time=$((end_time - start_time))
    
    # Show results
    echo ""
    print_header "Testing Complete"
    show_test_results
    print_status "Total execution time: ${total_time} seconds"
    
    if [[ $overall_exit_code -eq 0 ]]; then
        print_success "All tests passed successfully! 🎉"
    else
        print_error "Some tests failed. Check the logs for details."
    fi
    
    exit $overall_exit_code
}

# Run main function
main "$@" 