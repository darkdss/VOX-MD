/**
 * Session Backup and Recovery Tool
 * Used to backup, restore, and manage WhatsApp session data
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const SESSION_DIR = path.join(__dirname, '..', 'session');
const BACKUP_DIR = path.join(SESSION_DIR, 'backup');
const CREDS_FILE = path.join(SESSION_DIR, 'creds.json');
const MAX_BACKUPS = 10;

// Ensure directories exist
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

/**
 * Create a backup of the current session
 */
function backupSession() {
  try {
    if (!fs.existsSync(CREDS_FILE)) {
      console.error('❌ No session file found to backup.');
      return false;
    }

    // Read current session
    const sessionData = fs.readFileSync(CREDS_FILE, 'utf8');
    
    // Create a hash of the session data for identifying unique versions
    const hash = crypto.createHash('md5').update(sessionData).digest('hex').substring(0, 8);
    const timestamp = Date.now();
    const backupFile = path.join(BACKUP_DIR, `creds.${timestamp}.${hash}.json`);
    
    // Save backup
    fs.writeFileSync(backupFile, sessionData, 'utf8');
    console.log(`✅ Session backup created: ${path.basename(backupFile)}`);
    
    // Maintain only MAX_BACKUPS number of backups
    cleanupOldBackups();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to backup session:', error.message);
    return false;
  }
}

/**
 * Restore session from a specific backup or the latest one
 * @param {string|null} backupFile - Specific backup file to restore (optional)
 */
function restoreSession(backupFile = null) {
  try {
    // If no specific backup is provided, use the latest one
    if (!backupFile) {
      const backups = getBackupsList();
      if (backups.length === 0) {
        console.error('❌ No backups found to restore.');
        return false;
      }
      
      // Sort by timestamp (descending)
      backups.sort((a, b) => {
        const timestampA = parseInt(a.split('.')[1]);
        const timestampB = parseInt(b.split('.')[1]);
        return timestampB - timestampA;
      });
      
      backupFile = path.join(BACKUP_DIR, backups[0]);
      console.log(`📝 Using latest backup: ${backups[0]}`);
    } else if (!fs.existsSync(path.join(BACKUP_DIR, backupFile))) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      return false;
    } else {
      backupFile = path.join(BACKUP_DIR, backupFile);
    }
    
    // Backup current session before restoring
    if (fs.existsSync(CREDS_FILE)) {
      const currentData = fs.readFileSync(CREDS_FILE, 'utf8');
      fs.writeFileSync(
        path.join(BACKUP_DIR, `creds.${Date.now()}.current.json`), 
        currentData, 
        'utf8'
      );
    }
    
    // Restore from backup
    const backupData = fs.readFileSync(backupFile, 'utf8');
    fs.writeFileSync(CREDS_FILE, backupData, 'utf8');
    
    console.log(`✅ Session restored from: ${path.basename(backupFile)}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to restore session:', error.message);
    return false;
  }
}

/**
 * List all available backups
 */
function getBackupsList() {
  try {
    return fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('creds.') && file.endsWith('.json'));
  } catch (error) {
    console.error('❌ Failed to list backups:', error.message);
    return [];
  }
}

/**
 * Remove old backups exceeding the maximum limit
 */
function cleanupOldBackups() {
  try {
    const backups = getBackupsList();
    if (backups.length <= MAX_BACKUPS) return;
    
    // Sort by timestamp (ascending, oldest first)
    backups.sort((a, b) => {
      const timestampA = parseInt(a.split('.')[1]);
      const timestampB = parseInt(b.split('.')[1]);
      return timestampA - timestampB;
    });
    
    // Remove oldest backups
    const toRemove = backups.slice(0, backups.length - MAX_BACKUPS);
    for (const file of toRemove) {
      fs.unlinkSync(path.join(BACKUP_DIR, file));
      console.log(`🗑️ Removed old backup: ${file}`);
    }
  } catch (error) {
    console.error('❌ Failed to clean up old backups:', error.message);
  }
}

/**
 * List available backups with details
 */
function listBackups() {
  const backups = getBackupsList();
  if (backups.length === 0) {
    console.log('📝 No backups found.');
    return;
  }
  
  console.log(`\n📋 Available Backups (${backups.length}):`);
  console.log('=====================================');
  
  // Sort by timestamp (descending, newest first)
  backups.sort((a, b) => {
    const timestampA = parseInt(a.split('.')[1]);
    const timestampB = parseInt(b.split('.')[1]);
    return timestampB - timestampA;
  });
  
  backups.forEach((file, index) => {
    const parts = file.split('.');
    const timestamp = new Date(parseInt(parts[1])).toLocaleString();
    const hash = parts[2];
    console.log(`${index + 1}. ${file}`);
    console.log(`   Created: ${timestamp}`);
    console.log(`   Hash: ${hash}`);
    
    const stats = fs.statSync(path.join(BACKUP_DIR, file));
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('-------------------------------------');
  });
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

switch (command) {
  case 'backup':
    backupSession();
    break;
  case 'restore':
    const backupFile = args[1];
    restoreSession(backupFile);
    break;
  case 'list':
    listBackups();
    break;
  default:
    console.log('\n📚 Session Backup and Recovery Tool');
    console.log('====================================');
    console.log('Commands:');
    console.log('  backup              Create a new backup of the current session');
    console.log('  restore [filename]  Restore from a backup (latest if no filename)');
    console.log('  list                List all available backups');
    console.log('\nExamples:');
    console.log('  node session-backup.js backup');
    console.log('  node session-backup.js restore creds.1649832764000.a1b2c3d4.json');
    console.log('  node session-backup.js list');
}