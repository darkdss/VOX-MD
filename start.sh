#!/bin/bash

# Check if session directory exists
if [ ! -d "./session" ]; then
  echo "📁 Creating session directory..."
  mkdir -p ./session/backup
fi

# Set proper permissions
echo "🔧 Setting permissions..."
chmod -R 755 ./session

# Create a backup of the current session if it exists
if [ -f "./session/creds.json" ]; then
  echo "💾 Creating session backup..."
  node ./scripts/session-backup.js backup
fi

# Start the bot
echo "🚀 Starting VOX-MD Bot..."
exec node index.js