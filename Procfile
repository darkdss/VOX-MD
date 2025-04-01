# Procfile for VOX-MD

# Start the web process using PM2 to manage the Node.js application
web: NODE_ENV=production npx pm2 start index.js --no-daemon --watch --ignore-watch=".pm2 session/creds.json"

# Optionally, you can set the NODE_ENV to other values like development or test
# web: NODE_ENV=development npx pm2 start index.js --no-daemon --watch
# web: NODE_ENV=test npx pm2 start index.js --no-daemon --watch

# The --watch flag ensures that PM2 will restart the process if it crashes or if files change
