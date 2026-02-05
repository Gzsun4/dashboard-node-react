#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Install Chromium for Puppeteer/WhatsApp
echo "Installing Chromium..."
npx puppeteer browsers install chrome
