const fs = require("fs");
const path = require("path");
const { session } = require("./settings");
const { useMultiFileAuthState } = require("@whiskeysockets/baileys");

// Optional: Import session backup utilities if available
let sessionBackupUtils = null;
try {
    sessionBackupUtils = require("./scripts/session-backup");
} catch (error) {
    // Session backup utilities not available, will use basic backup method
}

/**
 * Authenticate WhatsApp session
 * - Handles session restoration, creation, and validation
 * - Added more robust error handling and recovery mechanisms
 * - Improved logging for better debugging
 * - Integrated with advanced session backup system
 */
async function authenticateSession() {
    try {
        const sessionFolder = "./session";
        const sessionPath = `${sessionFolder}/creds.json`;
        const sessionBackupPath = `${sessionFolder}/creds.json.bak`;
        const backupFolder = path.join(sessionFolder, "backup");

        // Create session folders if they don't exist
        if (!fs.existsSync(sessionFolder)) {
            console.log("📁 Creating session folder...");
            fs.mkdirSync(sessionFolder, { recursive: true });
        }
        
        // Create backup folder if it doesn't exist
        if (!fs.existsSync(backupFolder)) {
            console.log("📁 Creating backup folder...");
            fs.mkdirSync(backupFolder, { recursive: true });
        }

        let sessionData = null;
        let usingBackup = false;
        let backupSource = null;

        // First attempt: Try to load existing session
        if (fs.existsSync(sessionPath)) {
            try {
                console.log("🔄 Restoring session...");
                sessionData = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
            } catch (error) {
                console.error("⚠️ Corrupted session file:", error.message);
                
                // Second attempt: Try to load immediate backup if available
                if (fs.existsSync(sessionBackupPath)) {
                    try {
                        console.log("🔄 Trying immediate session backup...");
                        sessionData = JSON.parse(fs.readFileSync(sessionBackupPath, "utf8"));
                        usingBackup = true;
                        backupSource = "immediate";
                    } catch (backupError) {
                        console.error("⚠️ Immediate backup also corrupted. Will try advanced backups.");
                    }
                }
                
                // Third attempt: Try to find any valid backup in the backup folder
                if (!usingBackup) {
                    try {
                        const backupFiles = fs.readdirSync(backupFolder)
                            .filter(file => file.endsWith('.json') && file.includes('creds.'))
                            .sort((a, b) => {
                                // Sort by timestamp (newest first)
                                const timeA = parseInt(a.split('.')[1]) || 0;
                                const timeB = parseInt(b.split('.')[1]) || 0;
                                return timeB - timeA;
                            });
                            
                        // Try backups one by one until a valid one is found
                        for (const backupFile of backupFiles) {
                            try {
                                const backupData = fs.readFileSync(path.join(backupFolder, backupFile), "utf8");
                                sessionData = JSON.parse(backupData);
                                console.log(`🔄 Recovered from backup: ${backupFile}`);
                                usingBackup = true;
                                backupSource = "advanced";
                                break;
                            } catch (e) {
                                console.log(`⚠️ Backup ${backupFile} is also invalid. Trying next...`);
                            }
                        }
                    } catch (e) {
                        console.error("❌ Error searching for backups:", e.message);
                    }
                }
                
                // If session is corrupted, backup and remove
                if (!usingBackup) {
                    try {
                        // Keep a backup of corrupted file for later inspection
                        const corruptedBackupPath = path.join(backupFolder, `creds.corrupted.${Date.now()}.json`);
                        fs.copyFileSync(sessionPath, corruptedBackupPath);
                        fs.unlinkSync(sessionPath); // Delete corrupted session file
                        console.log(`⚠️ Corrupted session backed up to: ${corruptedBackupPath}`);
                    } catch (e) {
                        console.error("❌ Error creating backup of corrupted session:", e.message);
                    }
                } else if (backupSource) {
                    // Restore the working backup to main session file
                    try {
                        fs.writeFileSync(sessionPath, JSON.stringify(sessionData), "utf8");
                        console.log(`✅ Restored session from ${backupSource} backup`);
                    } catch (e) {
                        console.error("❌ Error writing restored session:", e.message);
                    }
                }
            }
        }
        
        // If no valid session from file, create a new one from environment/settings
        if (!sessionData && session && session !== "zokk") {
            console.log("📡 Creating new session from credentials...");
            try {
                sessionData = Buffer.from(session, "base64").toString("utf8");
                
                // Create a backup of the initial session data
                fs.writeFileSync(sessionPath, sessionData, "utf8");
                fs.writeFileSync(sessionBackupPath, sessionData, "utf8");
                
                // Also save to backup folder
                const initialBackupPath = path.join(backupFolder, `creds.${Date.now()}.initial.json`);
                fs.writeFileSync(initialBackupPath, sessionData, "utf8");
                console.log("✅ Session created and backups saved");
            } catch (error) {
                console.error("❌ Error decoding session data:", error.message);
                return null;
            }
        }

        // Use Baileys session manager with error handling
        console.log("🔐 Initializing WhatsApp auth state...");
        const { state, saveCreds } = await useMultiFileAuthState(sessionFolder).catch((err) => {
            console.error("❌ Baileys Auth Error:", err);
            return { state: null, saveCreds: null };
        });

        if (!state) {
            console.error("❌ Failed to initialize session state");
            throw new Error("Failed to initialize Baileys session.");
        }

        // Enhanced saveCreds function that also creates a backup
        const enhancedSaveCreds = async (...args) => {
            try {
                // Call the original saveCreds
                await saveCreds(...args);
                
                // Create immediate backup of the session after successful save
                if (fs.existsSync(sessionPath)) {
                    fs.copyFileSync(sessionPath, sessionBackupPath);
                    
                    // Create a timestamped backup in backup folder (limit frequency to avoid too many files)
                    const now = Date.now();
                    const lastBackupMarker = path.join(backupFolder, '.last_backup_time');
                    let shouldCreateBackup = true;
                    
                    // Only create a new backup if more than 1 hour has passed since the last one
                    if (fs.existsSync(lastBackupMarker)) {
                        try {
                            const lastBackupTime = parseInt(fs.readFileSync(lastBackupMarker, 'utf8')) || 0;
                            if (now - lastBackupTime < 3600000) { // 1 hour in milliseconds
                                shouldCreateBackup = false;
                            }
                        } catch (e) {
                            // If we can't read the last backup time, create a backup anyway
                        }
                    }
                    
                    if (shouldCreateBackup) {
                        // Use advanced backup if available
                        if (sessionBackupUtils && typeof sessionBackupUtils.backupSession === 'function') {
                            sessionBackupUtils.backupSession();
                        } else {
                            // Simple backup
                            const periodicBackupPath = path.join(backupFolder, `creds.${now}.json`);
                            fs.copyFileSync(sessionPath, periodicBackupPath);
                            
                            // Clean up old backups (keep only last 10)
                            try {
                                const backupFiles = fs.readdirSync(backupFolder)
                                    .filter(file => file.endsWith('.json') && !file.includes('corrupted') && !file.includes('initial'))
                                    .sort((a, b) => {
                                        const timeA = parseInt(a.split('.')[1]) || 0;
                                        const timeB = parseInt(b.split('.')[1]) || 0;
                                        return timeB - timeA; // newest first
                                    });
                                
                                // Keep only 10 most recent backups
                                if (backupFiles.length > 10) {
                                    for (let i = 10; i < backupFiles.length; i++) {
                                        fs.unlinkSync(path.join(backupFolder, backupFiles[i]));
                                    }
                                }
                            } catch (e) {
                                console.error("❌ Error cleaning up old backups:", e.message);
                            }
                        }
                        
                        // Update last backup time
                        fs.writeFileSync(lastBackupMarker, now.toString(), 'utf8');
                    }
                }
            } catch (error) {
                console.error("❌ Error saving credentials:", error.message);
            }
        };

        console.log("✅ Authentication successful!");
        return { state, saveCreds: enhancedSaveCreds };
    } catch (e) {
        console.error("❌ Session error:", e);
        return null;
    }
}

// Prevent duplicate event listeners
process.removeAllListeners("uncaughtException");
process.on("uncaughtException", (err) => console.error("❌ Uncaught Exception:", err));

// Also handle unhandled promise rejections to prevent crashes
process.removeAllListeners("unhandledRejection");
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Promise Rejection:", reason);
});

module.exports = authenticateSession;