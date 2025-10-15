#!/bin/bash

# OrangeHRM E2E Test Execution Script
# This script provides various test execution options with enhanced reporting

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
TEST_SUITE="smoke"
BROWSER="chromium"
ENVIRONMENT="demo"
WORKERS=1
RETRIES=1
HEADED=false
REPORT_FORMAT="html,allure-playwright"

# Function to display usage
usage() {
    echo -e "${BLUE}OrangeHRM E2E Test Execution Script${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -s, --suite SUITE       Test suite to run (smoke|regression|employee|leave|access-control|visual|e2e|all)"
    echo "  -b, --browser BROWSER   Browser to run tests on (chromium|firefox|webkit|all)"
    echo "  -e, --env ENVIRONMENT   Environment to test against (demo|staging|prod)"
    echo "  -w, --workers WORKERS   Number of parallel workers (default: 1)"
    echo "  -r, --retries RETRIES   Number of retry attempts (default: 1)"
    echo "  -h, --headed           Run tests in headed mode"
    echo "  --report FORMAT        Report format (html|allure-playwright|json|junit)"
    echo "  --help                 Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -s smoke -b chromium"
    echo "  $0 -s regression -b all -w 4"
    echo "  $0 -s e2e -b firefox --headed"
    echo ""
}

# Function to set environment variables based on environment
set_environment() {
    case $1 in
        "demo")
            export BASE_URL="https://opensource-demo.orangehrmlive.com"
            export ADMIN_USERNAME="Admin"
            export ADMIN_PASSWORD="admin123"
            export ESS_USERNAME="linda.anderson"
            export ESS_PASSWORD="ess123"
            export MANAGER_USERNAME="manager"
            export MANAGER_PASSWORD="manager123"
            ;;
        "staging")
            # Staging environment variables (would be set from secrets)
            export BASE_URL="${STAGING_BASE_URL}"
            export ADMIN_USERNAME="${STAGING_ADMIN_USERNAME}"
            export ADMIN_PASSWORD="${STAGING_ADMIN_PASSWORD}"
            export ESS_USERNAME="${STAGING_ESS_USERNAME}"
            export ESS_PASSWORD="${STAGING_ESS_PASSWORD}"
            export MANAGER_USERNAME="${STAGING_MANAGER_USERNAME}"
            export MANAGER_PASSWORD="${STAGING_MANAGER_PASSWORD}"
            ;;
        "prod")
            # Production environment variables (would be set from secrets)
            export BASE_URL="${PROD_BASE_URL}"
            export ADMIN_USERNAME="${PROD_ADMIN_USERNAME}"
            export ADMIN_PASSWORD="${PROD_ADMIN_PASSWORD}"
            export ESS_USERNAME="${PROD_ESS_USERNAME}"
            export ESS_PASSWORD="${PROD_ESS_PASSWORD}"
            export MANAGER_USERNAME="${PROD_MANAGER_USERNAME}"
            export MANAGER_PASSWORD="${PROD_MANAGER_PASSWORD}"
            ;;
        *)
            echo -e "${RED}Error: Unknown environment '$1'${NC}"
            exit 1
            ;;
    esac
}

# Function to convert suite name to grep pattern
get_grep_pattern() {
    case $1 in
        "smoke")
            echo "@smoke"
            ;;
        "regression")
            echo "@regression"
            ;;
        "employee")
            echo "@employee"
            ;;
        "leave")
            echo "@leave"
            ;;
        "access-control")
            echo "@access-control"
            ;;
        "visual")
            echo "@visual"
            ;;
        "e2e")
            echo "@e2e"
            ;;
        "critical")
            echo "@critical"
            ;;
        "all")
            echo ".*"
            ;;
        *)
            echo -e "${RED}Error: Unknown test suite '$1'${NC}"
            exit 1
            ;;
    esac
}

# Function to run health check
health_check() {
    echo -e "${BLUE}Running environment health check...${NC}"
    
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" || echo "000")
    
    if [ "$response_code" -eq 200 ]; then
        echo -e "${GREEN}✅ Environment health check passed (HTTP $response_code)${NC}"
        return 0
    else
        echo -e "${RED}❌ Environment health check failed (HTTP $response_code)${NC}"
        return 1
    fi
}

# Function to install dependencies if needed
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}Installing dependencies...${NC}"
        npm ci
    fi
    
    if [ ! -d "node_modules/.bin" ] || [ ! -f "node_modules/.bin/playwright" ]; then
        echo -e "${BLUE}Installing Playwright browsers...${NC}"
        npx playwright install --with-deps
    fi
}

# Function to run tests
run_tests() {
    local grep_pattern=$(get_grep_pattern "$TEST_SUITE")
    local playwright_args=""
    
    # Build Playwright command arguments
    if [ "$BROWSER" != "all" ]; then
        playwright_args="$playwright_args --project=$BROWSER"
    fi
    
    if [ "$WORKERS" -gt 1 ]; then
        playwright_args="$playwright_args --workers=$WORKERS"
    fi
    
    if [ "$RETRIES" -gt 0 ]; then
        playwright_args="$playwright_args --retries=$RETRIES"
    fi
    
    if [ "$HEADED" = true ]; then
        playwright_args="$playwright_args --headed"
    fi
    
    playwright_args="$playwright_args --reporter=$REPORT_FORMAT"
    
    echo -e "${BLUE}Running tests with configuration:${NC}"
    echo -e "  Suite: ${YELLOW}$TEST_SUITE${NC}"
    echo -e "  Browser: ${YELLOW}$BROWSER${NC}"
    echo -e "  Environment: ${YELLOW}$ENVIRONMENT${NC}"
    echo -e "  Workers: ${YELLOW}$WORKERS${NC}"
    echo -e "  Retries: ${YELLOW}$RETRIES${NC}"
    echo -e "  Headed: ${YELLOW}$HEADED${NC}"
    echo -e "  Base URL: ${YELLOW}$BASE_URL${NC}"
    echo ""
    
    # Execute the tests
    echo -e "${BLUE}Executing: npx playwright test --grep \"$grep_pattern\" $playwright_args${NC}"
    
    if npx playwright test --grep "$grep_pattern" $playwright_args; then
        echo -e "${GREEN}✅ Tests completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Tests failed${NC}"
        return 1
    fi
}

# Function to generate Allure report
generate_allure_report() {
    if [[ "$REPORT_FORMAT" == *"allure"* ]]; then
        echo -e "${BLUE}Generating Allure report...${NC}"
        
        # Check if Allure is available
        if command -v allure &> /dev/null; then
            allure generate allure-results --clean -o allure-report
            echo -e "${GREEN}✅ Allure report generated at: allure-report/index.html${NC}"
        else
            echo -e "${YELLOW}⚠️  Allure CLI not found. Install from: https://docs.qameta.io/allure/#_installing_a_commandline${NC}"
        fi
    fi
}

# Function to open reports
open_reports() {
    if [ -f "playwright-report/index.html" ]; then
        echo -e "${BLUE}HTML report available at: playwright-report/index.html${NC}"
        
        # Try to open in browser (works on macOS and some Linux systems)
        if command -v open &> /dev/null; then
            open playwright-report/index.html
        elif command -v xdg-open &> /dev/null; then
            xdg-open playwright-report/index.html
        fi
    fi
    
    if [ -f "allure-report/index.html" ]; then
        echo -e "${BLUE}Allure report available at: allure-report/index.html${NC}"
        
        # Serve Allure report
        if command -v allure &> /dev/null; then
            echo -e "${BLUE}Starting Allure report server...${NC}"
            allure serve allure-results &
        fi
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--suite)
            TEST_SUITE="$2"
            shift 2
            ;;
        -b|--browser)
            BROWSER="$2"
            shift 2
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        -r|--retries)
            RETRIES="$2"
            shift 2
            ;;
        -h|--headed)
            HEADED=true
            shift
            ;;
        --report)
            REPORT_FORMAT="$2"
            shift 2
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option '$1'${NC}"
            usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo -e "${BLUE}🧪 OrangeHRM E2E Test Automation${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
    
    # Set environment variables
    set_environment "$ENVIRONMENT"
    
    # Run health check
    if ! health_check; then
        echo -e "${RED}Aborting test execution due to failed health check${NC}"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    if run_tests; then
        generate_allure_report
        open_reports
        echo -e "${GREEN}🎉 Test execution completed successfully!${NC}"
        exit 0
    else
        echo -e "${RED}💥 Test execution failed!${NC}"
        exit 1
    fi
}

# Run main function
main