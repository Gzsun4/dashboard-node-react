#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Install Chromium for Puppeteer/WhatsApp in a local folder
echo "Installing Chromium..."
PUPPETEER_CACHE_DIR=/opt/render/project/src/.puppeteer npx puppeteer browsers install chrome

# Create a stable symlink to avoid version number changes
echo "Creating stable symlink for Chrome..."
CHROME_BIN=$(find /opt/render/project/src/.puppeteer -name chrome -type f | head -n 1)

if [ -n "$CHROME_BIN" ]; then
  ln -sf "$CHROME_BIN" /opt/render/project/src/chrome-bin
  echo "✅ Chrome symlink created at /opt/render/project/src/chrome-bin"
  echo "🔗 Points to: $CHROME_BIN"
else
  echo "❌ Error: Could not find Chrome binary in /opt/render/project/src/.puppeteer"
  exit 1
fi
