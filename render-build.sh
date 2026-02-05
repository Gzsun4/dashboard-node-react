#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Install Chromium for Puppeteer/WhatsApp
echo "Installing Chromium..."
npx puppeteer browsers install chrome

# Find where it was installed to help debugging
echo "Verifying installation path..."
find /opt/render -name chrome -type f || true
find . -name chrome -type f || true
