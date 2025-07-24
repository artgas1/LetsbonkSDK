# LetsBonkSDK Deployment Scripts

This directory contains scripts for deploying and managing LetsBonk programs on localnet for testing purposes.

## Scripts Overview

### `deploy-localnet.sh`
Main deployment script that sets up a complete LetsBonk testing environment.

**Features:**
- Automatic Solana CLI validation
- Program downloading from mainnet (optional)
- Program cloning from mainnet (default)
- Account cloning for configuration
- Validator health monitoring
- Deployment verification
- Cleanup and management

**Usage:**
```bash
./deploy-localnet.sh [OPTIONS]

# Common commands
./deploy-localnet.sh              # Start with cloned programs
./deploy-localnet.sh -d           # Try downloading programs first
./deploy-localnet.sh -v           # Verify existing deployment
./deploy-localnet.sh -s           # Stop and cleanup
./deploy-localnet.sh -i           # Show program information
```

### `check-programs.sh`
Program status checker for both localnet and mainnet.

**Features:**
- Network reachability testing
- Program and account verification
- Detailed account information
- RPC health monitoring
- Lamport balance checking

**Usage:**
```bash
./check-programs.sh [OPTIONS]

# Common commands
./check-programs.sh               # Check both networks
./check-programs.sh -l            # Check localnet only
./check-programs.sh -m            # Check mainnet only
./check-programs.sh -r -l         # Show localnet RPC health
```

### `test-localnet.sh`
Automated test pipeline (created during integration test setup).

**Features:**
- Complete deployment automation
- Test execution
- Automatic cleanup
- Error handling and reporting

## Required Programs

### Main Programs
- **LetsBonk Raydium Launchpad**: `LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj`
- **Metaplex Token Metadata**: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`

### Configuration Accounts
- **Global Config**: `6s1xP3hpbAfFoNtUNF8mfHsjr2Bd97JxFJRWLbL6aHuX`
- **Platform Config**: `FfYek5vEz23cMkWsdJwG2oa6EphsvXSHrGpdALN4g6W1`
- **Event Authority**: `2DPAtwB8L12vrMRExbLuyGnC7n2J5LNoZQSejeQGpwkr`
- **Raydium Authority**: `WLHv2UAZm6z4KyaaELi5pjdbJh6RESMva1Rnn8pJVVh`

## Directory Structure

```
scripts/
├── deploy-localnet.sh      # Main deployment script
├── check-programs.sh       # Program status checker
├── test-localnet.sh        # Automated test pipeline
└── README.md              # This file

../test_ledger_config/     # Created by deployment script
├── letsbonk.so           # Downloaded program (optional)
├── metaplex.so           # Downloaded program (optional)
└── letsbonk_programs.json # Generated configuration
```

## NPM Integration

These scripts are integrated with NPM scripts in `package.json`:

### Deployment Commands
```bash
npm run deploy:localnet              # ./scripts/deploy-localnet.sh
npm run deploy:localnet:download     # ./scripts/deploy-localnet.sh -d
npm run deploy:verify                # ./scripts/deploy-localnet.sh -v
npm run deploy:stop                  # ./scripts/deploy-localnet.sh -s
npm run deploy:info                  # ./scripts/deploy-localnet.sh -i
```

### Program Checking Commands
```bash
npm run programs:check               # ./scripts/check-programs.sh
npm run programs:check:localnet      # ./scripts/check-programs.sh -l
npm run programs:check:mainnet       # ./scripts/check-programs.sh -m
```

### Testing Commands
```bash
npm run test:localnet                # Full automated test pipeline
npm run test:integration             # Integration tests only
npm run test:unit                    # Unit tests only
```

## Technical Details

### Deployment Process

1. **Prerequisites Check**
   - Validates Solana CLI installation
   - Checks for required tools

2. **Program Acquisition**
   - Downloads programs from mainnet (if `-d` flag used)
   - Falls back to cloning programs directly

3. **Validator Startup**
   - Configures solana-test-validator with programs
   - Clones configuration accounts from mainnet
   - Sets up proper network parameters

4. **Verification**
   - Tests program availability
   - Validates account accessibility
   - Confirms RPC connectivity

5. **Configuration**
   - Generates program configuration file
   - Sets up test environment

### Error Handling

- **Network Issues**: Automatic retry with backoff
- **Program Download Failures**: Graceful fallback to cloning
- **Validator Startup Issues**: Detailed error reporting
- **Cleanup**: Automatic cleanup on script exit

### Performance Optimizations

- **Parallel Operations**: Multiple account clones in parallel
- **Caching**: Downloaded programs are cached
- **Health Checks**: Fast RPC health monitoring
- **Timeout Management**: Proper timeout handling for all operations

## Troubleshooting

### Common Issues

1. **Solana CLI Not Found**
   ```bash
   # Install Solana CLI
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 8899
   lsof -i :8899
   
   # Kill existing validator
   pkill -f solana-test-validator
   ```

3. **Program Download Failures**
   ```bash
   # Use clone mode instead
   ./deploy-localnet.sh -c
   ```

4. **Network Connectivity Issues**
   ```bash
   # Check mainnet connectivity
   ./check-programs.sh -m
   
   # Check RPC health
   ./check-programs.sh -r -m
   ```

### Debug Mode

For verbose output, modify scripts to add debug flags:

```bash
# Add to top of script
set -x  # Enable debug mode

# Or run with bash debug
bash -x ./deploy-localnet.sh
```

### Logs and Monitoring

```bash
# View validator logs
solana logs

# Check validator status
solana cluster-info

# Monitor validator health
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  http://127.0.0.1:8899
```

## Development

### Modifying Scripts

When modifying the scripts:

1. **Test Changes Locally**
   ```bash
   # Test basic functionality
   ./deploy-localnet.sh -i
   
   # Test deployment
   ./deploy-localnet.sh -c
   
   # Test verification
   ./deploy-localnet.sh -v
   ```

2. **Validate Error Handling**
   ```bash
   # Test cleanup
   ./deploy-localnet.sh -s
   
   # Test with invalid options
   ./deploy-localnet.sh --invalid-option
   ```

3. **Update Documentation**
   - Update this README
   - Update main README.localnet.md
   - Update NPM script descriptions

### Environment Variables

Scripts support customization via environment variables:

```bash
# Custom RPC URLs
export MAINNET_URL="https://api.mainnet-beta.solana.com"
export LOCALNET_URL="http://127.0.0.1:8899"

# Custom paths
export PROGRAMS_DIR="/custom/path/to/programs"
export LEDGER_PATH="/custom/ledger/path"

# Custom port
export VALIDATOR_PORT=8900
```

## Security Considerations

- Scripts download programs from public mainnet
- No private keys are handled by deployment scripts
- Test wallets are generated during test execution only
- Cleanup removes all temporary files and processes

## Contributing

When adding new functionality:

1. Follow existing code patterns
2. Add proper error handling
3. Include help documentation
4. Test all code paths
5. Update relevant documentation 