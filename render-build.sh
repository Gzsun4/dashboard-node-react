#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Install Chromium for Puppeteer/WhatsApp
echo "Installing Chromium..."
npx puppeteer browsers install chrome

# Create a stable symlink to avoid version number changes
echo "Creating stable symlink for Chrome..."
CHROME_PATH=$(find .cache/puppeteer -name chrome -type f | head -n 1)
if [ -n "$CHROME_PATH" ]; then
  ln -sf /opt/render/project/src/$CHROME_PATH /opt/render/project/src/chrome-bin
  echo "✅ Chrome symlink created at /opt/render/project/src/chrome-bin"
else
  echo "❌ Error: Could not find Chrome binary"
  exit 1
fi
