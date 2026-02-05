#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Install Chromium for Puppeteer/WhatsApp in a local folder
echo "Installing Chromium..."
export PUPPETEER_CACHE_DIR=/opt/render/project/src/.puppeteer
npx puppeteer browsers install chrome

# Create a stable symlink to avoid version number changes
echo "Creating stable symlink for Chrome..."
# Find the actual binary
CHROME_BIN=$(find .puppeteer -name chrome -type f | head -n 1)

if [ -n "$CHROME_BIN" ]; then
  # Create a symlink in the root
  ln -sf "$CHROME_BIN" chrome-bin
  chmod +x chrome-bin
  echo "✅ Chrome symlink created at: $(pwd)/chrome-bin"
  echo "🔗 Points to: $CHROME_BIN"
  ls -l chrome-bin
else
  echo "❌ Error: Could not find Chrome binary in .puppeteer"
  find .puppeteer -maxdepth 4
  exit 1
fi
