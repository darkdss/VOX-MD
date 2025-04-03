#!/bin/bash
set -e

# Function to handle signals
handle_signal() {
  echo "Caught signal, stopping application gracefully..."
  if pgrep -x "node" > /dev/null; then
    echo "Stopping node process..."
    pkill -15 node
  fi
  if command -v pm2 &> /dev/null && pm2 list | grep -q "voxmd"; then
    echo "Stopping PM2 processes..."
    pm2 stop all
    pm2 delete all
  fi
  exit 0
}

# Set up trap for signals
trap handle_signal SIGTERM SIGINT

# Verify session directory permissions
echo "Checking session directory permissions..."
chmod -R 777 /app/session
chmod -R 777 /app/media
chmod -R 777 /app/temp

# Check if backup directory exists and create if needed
if [ ! -d "/app/session/backup" ]; then
  echo "Creating backup directory..."
  mkdir -p /app/session/backup
fi

# Create a session backup if creds.json exists
if [ -f "/app/session/creds.json" ]; then
  echo "Creating session backup..."
  cp /app/session/creds.json /app/session/backup/creds.json.bak.$(date +%s)
  # Limit to 5 most recent backups
  ls -t /app/session/backup/creds.json.bak.* 2>/dev/null | tail -n +6 | xargs -r rm
fi

echo "Starting WhatsApp Bot..."
exec "$@"