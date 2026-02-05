#!/usr/bin/env bash
# This script ensures chrome is installed and symlinked in Render

if [ "$RENDER" = "true" ]; then
  echo "🚀 [Render Detectado] Preparando entorno para WhatsApp Bot..."
  
  # Directorio local para el cache de puppeteer
  export PUPPETEER_CACHE_DIR=/opt/render/project/src/.puppeteer
  
  echo "Installing Chromium..."
  npx puppeteer browsers install chrome
  
  # Crear symlink estable
  echo "Creating stable symlink for Chrome..."
  CHROME_BIN=$(find /opt/render/project/src/.puppeteer -name chrome -type f | head -n 1)
  
  if [ -n "$CHROME_BIN" ]; then
    ln -sf "$CHROME_BIN" /opt/render/project/src/chrome-bin
    chmod +x /opt/render/project/src/chrome-bin
    echo "✅ Chrome symlink created at: /opt/render/project/src/chrome-bin"
  else
    echo "❌ Error: Could not find Chrome binary after install."
  fi
else
  echo "Skipping Chrome install (Not on Render)"
fi
