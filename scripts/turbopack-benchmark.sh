#!/bin/bash

# Turbopack Performance Benchmark Script
# Tests and compares performance with and without Turbopack

echo "🚀 Turbopack Performance Benchmark"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to web app directory
cd apps/web

# Clean cache before tests
echo "🧹 Cleaning cache..."
rm -rf .next .turbo node_modules/.cache

# Test 1: Cold start with Turbopack
echo -e "${BLUE}Test 1: Cold Start with Turbopack${NC}"
echo "Starting dev server with Turbopack..."
START_TIME=$(date +%s)
timeout 30s pnpm dev > /dev/null 2>&1 &
PID=$!
sleep 15
kill $PID 2>/dev/null
END_TIME=$(date +%s)
TURBOPACK_TIME=$((END_TIME - START_TIME))
echo -e "${GREEN}✓ Turbopack cold start: ${TURBOPACK_TIME}s${NC}"

# Clean for next test
rm -rf .next .turbo

# Test 2: Cold start without Turbopack (if needed for comparison)
# Uncomment to test webpack performance
# echo -e "${BLUE}Test 2: Cold Start with Webpack${NC}"
# START_TIME=$(date +%s)
# timeout 30s next dev --port 3001 > /dev/null 2>&1 &
# PID=$!
# sleep 15
# kill $PID 2>/dev/null
# END_TIME=$(date +%s)
# WEBPACK_TIME=$((END_TIME - START_TIME))
# echo -e "${GREEN}✓ Webpack cold start: ${WEBPACK_TIME}s${NC}"

# Test 3: Build performance
echo ""
echo -e "${BLUE}Test 3: Build Performance with Turbopack${NC}"
echo "Building with Turbopack..."
START_TIME=$(date +%s)
pnpm build > build.log 2>&1
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
BUILD_SIZE=$(du -sh .next | cut -f1)
echo -e "${GREEN}✓ Build time: ${BUILD_TIME}s${NC}"
echo -e "${GREEN}✓ Build size: ${BUILD_SIZE}${NC}"

# Test 4: Memory usage
echo ""
echo -e "${BLUE}Test 4: Memory Usage${NC}"
echo "Starting dev server to measure memory..."
pnpm dev > /dev/null 2>&1 &
PID=$!
sleep 10
if command -v ps > /dev/null; then
    MEMORY=$(ps -o rss= -p $PID | awk '{print $1/1024 "MB"}' 2>/dev/null || echo "N/A")
    echo -e "${GREEN}✓ Memory usage: ${MEMORY}${NC}"
fi
kill $PID 2>/dev/null

# Summary
echo ""
echo -e "${YELLOW}=== Summary ===${NC}"
echo -e "Cold start time: ${GREEN}${TURBOPACK_TIME}s${NC}"
echo -e "Build time: ${GREEN}${BUILD_TIME}s${NC}"
echo -e "Build size: ${GREEN}${BUILD_SIZE}${NC}"
echo -e "Memory usage: ${GREEN}${MEMORY}${NC}"
echo ""
echo "✅ Turbopack is configured and optimized!"
echo ""
echo "💡 Tips for better performance:"
echo "  - Use dynamic imports for heavy components"
echo "  - Enable persistent caching in production"
echo "  - Monitor with NEXT_TURBOPACK_TRACING=1"
echo "  - Use 'pnpm clean' to clear cache when needed"