
/* VOX-MD - The Modern WhatsApp Bot */

const {
default: voxmdConnect,
useMultiFileAuthState,
DisconnectReason,
fetchLatestBaileysVersion,
makeInMemoryStore,
downloadContentFromMessage,
jidDecode,
proto,
getContentType,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const FileType = require("file-type");
const { exec, spawn, execSync } = require("child_process");
const axios = require("axios");
const chalk = require("chalk");
const { DateTime } = require("luxon");
const figlet = require("figlet");
const express = require("express");
require('events').EventEmitter.defaultMaxListeners = 100;
const app = express();
const port = process.env.PORT || 10000;
const _ = require("lodash");
const PhoneNumber = require("awesome-phonenumber");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/botFunctions');
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const { session } = require("./settings");
const authenticateSession = require('./kanambo'); // Import from kanambo.js
const path = require('path');
const sessionName = "session";
const { smsg } = require("./smsg");
const { autoview, presence, autoread, botname, autobio, mode, prefix, dev, autolike } = require("./settings");

// Keep-alive mechanism to prevent service from being idle
const KEEP_ALIVE_INTERVAL = parseInt(process.env.KEEP_ALIVE_INTERVAL || "60000"); // Default to 60 seconds
const { commands, totalCommands,aliases } = require("./VoxMdhandler");
const groupEvents = require("./groupEvents.js");

async function startvoxmd() {
// Use the centralized authentication function from kanambo.js
const authResult = await authenticateSession();
if (!authResult) {
    console.error("❌ Authentication failed. Session could not be initialized.");
    process.exit(1);
}
const { saveCreds, state } = authResult;
const client = voxmdConnect({
logger: pino({ level: "silent" }),
printQRInTerminal: true,
version: [2, 3000, 1015901307],
browser: ["voxmd", "Safari", "3.0"],
auth: state
});

store.bind(client.ev);

// ✅ Save store data every 3 seconds
setInterval(() => {
    store.writeToFile("store.json");
}, 5000);

// ✅ Auto-bio update
if (autobio === "true") {
    setInterval(async () => {
        try {
            const date = new Date();
            await client.updateProfileStatus(
                `⚡ ${botname} is active 24/7 ⚡\n📅 ${date.toLocaleString("en-US", { timeZone: "Africa/Nairobi", weekday: "long" })}`
            );
        } catch (error) {}
    }, 8 * 10 * 1000);
}

// ✅ Prevent duplicate event listeners
client.ev.removeAllListeners("messages.upsert");

client.ev.on("messages.upsert", async (chatUpdate) => {
    try {
        let mek = chatUpdate.messages[0];
        if (!mek?.message) return;

        mek.message = mek.message.ephemeralMessage ? mek.message.ephemeralMessage.message : mek.message;

        // ✅ Auto-view & Auto-like status updates  
        if (autoview?.trim().toLowerCase() === "true" && mek.key?.remoteJid === "status@broadcast") {
            await client.readMessages([mek.key]);
        }

        if (autolike?.trim().toLowerCase() === "true" && mek.key?.remoteJid === "status@broadcast") {
            try {
                const mokayas = await client.decodeJid(client.user.id);
                const reactEmoji = "🥷"; // Custom emoji
                const participant = mek.key.participant || mek.participant || mek.key.remoteJid;

                if (participant) {
                    await client.sendMessage(
                        mek.key.remoteJid,
                        { react: { key: mek.key, text: reactEmoji } },
                        { statusJidList: [participant, mokayas] }
                    );
                }
            } catch (error) {}
        }

        // ✅ Auto-read private messages  
        if (autoread?.trim().toLowerCase() === "true" && mek.key?.remoteJid?.endsWith("@s.whatsapp.net")) {
            await client.readMessages([mek.key]);
        }

        // ✅ Presence Updates  
        if (mek.key?.remoteJid) {
            let chat = mek.key.remoteJid;
            let presenceType = presence.toLowerCase();

            if (["online", "typing", "recording", "unavailable"].includes(presenceType)) {
                await client.sendPresenceUpdate(presenceType, chat);
            }
        }

        let sender = mek.key?.remoteJid || mek.participant || mek.key?.participant;

        // ✅ Owner & Developer Check  
        const ownerNumber = "254114148625";
        if (mode?.toLowerCase() === "private") {
            const allowedUsers = [`${ownerNumber}@s.whatsapp.net`, `${dev}@s.whatsapp.net`];
            if (!mek.key.fromMe && !allowedUsers.includes(sender)) return;
        }

        let m = smsg(client, mek, store);
        require("./Voxdat")(client, m, chatUpdate, store);

    } catch (error) {}
});

// ✅ Handle unhandled promise rejections
const unhandledRejections = new Map();

process.on("unhandledRejection", (reason, promise) => {
    unhandledRejections.set(promise, reason);
    console.error("❌ Unhandled Rejection at:", promise, "\n🔍 Reason:", reason);
});

process.on("rejectionHandled", (promise) => {
    unhandledRejections.delete(promise);
});

// ✅ Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("⚠️ Uncaught Exception:", err);
});

// ✅ Decode JID function
client.decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {};
return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
} else return jid;
};

// ✅ Get Name function
client.getName = (jid, withoutContact = false) => {
id = client.decodeJid(jid);
withoutContact = client.withoutContact || withoutContact;
let v;
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {};
if (!(v.name || v.subject)) v = client.groupMetadata(id) || {};
resolve(v.name || v.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international"));
});
else v = id === "0@s.whatsapp.net" ? { id, name: "WhatsApp" } :
id === client.decodeJid(client.user.id) ? client.user :
store.contacts[id] || {};
return (withoutContact ? "" : v.name) || v.subject || v.verifiedName ||
PhoneNumber("+" + jid.replace("@s.whatsapp.net", "")).getNumber("international");
};

client.ev.removeAllListeners("connection.update"); // Prevent duplicate listeners

client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // If QR code is received, log it for easy scanning
    if (qr) {
        console.log("📱 New QR code received. Please scan with WhatsApp to authenticate.");
    }

    if (connection === "close") {
        // Get error code if available
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const errorMessage = lastDisconnect?.error?.message || "unknown reason";
        
        console.log(`⚠️ Connection closed due to ${errorMessage} (Code: ${statusCode || 'N/A'})`);
        
        // Check for specific error conditions that require different handling
        if (statusCode === DisconnectReason.loggedOut || 
            statusCode === DisconnectReason.sessionReplaced) {
            // Session issues - need new authentication
            console.log("🔑 Session logged out or replaced. Attempting to authenticate again...");
            
            // Try session recovery instead of just exiting
            try {
                // Backup current session
                if (fs.existsSync("./session/creds.json")) {
                    const backupPath = `./session/backup/creds.${Date.now()}.backup_before_reauth.json`;
                    fs.copyFileSync("./session/creds.json", backupPath);
                    console.log(`📑 Created backup of current session: ${backupPath}`);
                }
                
                // Schedule restart with slight delay
                setTimeout(() => {
                    console.log("🔄 Restarting with session recovery...");
                    startvoxmd();
                }, 10000); // 10 second delay before trying
            } catch (error) {
                console.error("❌ Error during session recovery:", error);
            }
        } 
        else if (statusCode === DisconnectReason.connectionClosed || 
                 statusCode === DisconnectReason.connectionLost || 
                 statusCode === DisconnectReason.connectionReplaced) {
            // Connection issues - retry with exponential backoff
            console.log("🔄 Connection issue detected. Attempting to reconnect...");
            
            // Use exponential backoff for reconnection (5-10 seconds)
            const backoffDelay = Math.floor(Math.random() * 5000) + 5000;
            console.log(`⏱️ Reconnecting in ${backoffDelay/1000} seconds...`);
            
            setTimeout(() => {
                console.log("🔄 Restarting VOX-MD...");
                startvoxmd();
            }, backoffDelay);
        }
        else if (statusCode === DisconnectReason.timedOut) {
            // Timeout issues
            console.log("⏱️ Connection timed out. Reconnecting immediately...");
            setTimeout(() => startvoxmd(), 3000);
        }
        else {
            // Other issues - use standard reconnection logic
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                console.log("🔄 Attempting to reconnect...");
                setTimeout(() => {
                    console.log("🔄 Restarting VOX-MD...");
                    startvoxmd();
                }, 5000);
            } else {
                console.log("❌ Connection closed permanently. Manual restart required.");
            }
        }
    }

    if (connection === "open") {
        try {
            console.log(chalk.greenBright(`✅ Connection successful!\nLoaded ${totalCommands} commands.\nVOX-MD is active.`));
            
            // Memory management: Actively clean up
            try {
                // Force garbage collection if available (Node with --expose-gc flag)
                if (global.gc) {
                    global.gc();
                    console.log("🧹 Garbage collection triggered");
                }
            } catch (e) {
                // GC not available, do manual cleanup
                console.log("📊 Memory usage before cleanup:", process.memoryUsage());
            }
            
            // Set up periodic memory cleanup
            const memoryCleanupInterval = setInterval(() => {
                try {
                    console.log("📊 Current memory usage:", process.memoryUsage());
                    
                    // Clean store objects periodically to prevent memory buildup
                    if (store && typeof store.writeToFile === 'function') {
                        // Save store to disk
                        store.writeToFile("store.json");
                        
                        // Cleanup old message objects from memory
                        // This prevents the store from growing indefinitely
                        const currentTime = Date.now();
                        const oneHourAgo = currentTime - (60 * 60 * 1000);
                        
                        // Only retain recent messages
                        Object.keys(store.messages).forEach(jid => {
                            store.messages[jid] = store.messages[jid].filter(msg => {
                                const msgTime = msg.messageTimestamp * 1000;
                                return msgTime > oneHourAgo;
                            });
                        });
                        
                        console.log("🧹 Message store cleaned up");
                    }
                    
                    // Force garbage collection if available
                    if (global.gc) {
                        global.gc();
                        console.log("🧹 Garbage collection triggered");
                    }
                } catch (err) {
                    console.error("❌ Error during memory cleanup:", err.message);
                }
            }, 30 * 60 * 1000); // Run every 30 minutes
            
            // Perform startup tasks with error handling and reduced load
            setTimeout(async () => {
                try {
                    // Join group if invite is valid - with retry mechanism
                    let inviteCode = "GtX7EEvjLSoI63kInzWwID";
                    let joined = false;
                    let retryCount = 0;
                    
                    const joinGroup = async () => {
                        if (joined || retryCount > 2) return;
                        
                        try {
                            let groupInfo = await client.groupGetInviteInfo(inviteCode);
    
                            if (groupInfo) {
                                console.log("✅ Valid group invite. Joining...");
                                await client.groupAcceptInvite(inviteCode);
                                console.log("✅ Successfully joined the group!");
                                joined = true;
                                
                                // Send message only after joining the group
                                const getGreeting = () => {
                                    const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
                                    if (currentHour >= 5 && currentHour < 12) return "🌄 *Good Morning*";
                                    if (currentHour >= 12 && currentHour < 18) return "☀️ *Good Afternoon*";
                                    if (currentHour >= 18 && currentHour < 22) return "🌆 *Good Evening*";
                                    return "🌙 *Good Night*";
                                };
    
                                let message = `╭═══💠 *VOX-MD CONNECTED ✅* 💠═══╮\n`;
                                message += `┃ 🔓 *MODE:* ${mode.toUpperCase()}\n`;
                                message += `┃ 📝 *PREFIX:* ${prefix}\n`;
                                message += `╰═══〘 *KANAMBO* 〙═══╯\n\n`;
                                message += `✨ ${getGreeting()},am using *VOX-MD*! 🚀\n`;
    
                                // Send a message to owner
                                try {
                                    await client.sendMessage("254114148625@s.whatsapp.net", { text: message });
                                } catch (msgErr) {
                                    console.error("❌ Error sending startup message:", msgErr.message);
                                }
                            } else {
                                console.log("❌ Invalid or expired group invite.");
                            }
                        } catch (error) {
                            console.error(`❌ Error joining group (attempt ${retryCount + 1}/3):`, error.message);
                            retryCount++;
                            
                            // Retry with exponential backoff
                            if (retryCount <= 2) {
                                const delay = 5000 * Math.pow(2, retryCount);
                                console.log(`⏱️ Retrying in ${delay/1000} seconds...`);
                                setTimeout(joinGroup, delay);
                            }
                        }
                    };
                    
                    // Start the join process
                    joinGroup();
                    
                } catch (error) {
                    console.error("❌ Error in startup tasks:", error.message);
                }
            }, 5000); // Delay startup tasks to ensure stable connection first
            
        } catch (error) {
            console.error("❌ Error in connection open handler:", error.message);
        }
    }
});

client.ev.on("creds.update", saveCreds);
client.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || '';
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
const stream = await downloadContentFromMessage(message, messageType);
let buffer = Buffer.from([]);
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}

return buffer

};

client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message;
let mime = (message.msg || message).mimetype || '';
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
const stream = await downloadContentFromMessage(quoted, messageType);
let buffer = Buffer.from([]);
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]);
}
let type = await FileType.fromBuffer(buffer);
const trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
// save to file
await fs.writeFileSync(trueFileName, buffer);
return trueFileName;
};

}

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

// Health check endpoint for Koyeb
app.get("/health", (req, res) => {
  // Return a 200 OK status to indicate the service is running
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Self ping keep-alive mechanism
let keepAliveInterval;
function setupKeepAlive() {
  // Clear any existing interval
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  
  // Setup new interval
  keepAliveInterval = setInterval(() => {
    try {
      const timestamp = new Date().toISOString();
      console.log(`🔄 Keep-alive ping at ${timestamp}`);
      
      // Make a request to our own health endpoint to keep the service active
      axios.get(`http://localhost:${port}/health`)
        .then(response => {
          if (response.status === 200) {
            console.log(`✅ Keep-alive successful: ${response.data.status}`);
          }
        })
        .catch(error => {
          console.error(`❌ Keep-alive request failed:`, error.message);
        });
    } catch (error) {
      console.error(`❌ Error in keep-alive mechanism:`, error.message);
    }
  }, KEEP_ALIVE_INTERVAL);
  
  console.log(`🔄 Keep-alive mechanism set up with interval of ${KEEP_ALIVE_INTERVAL}ms`);
}

app.listen(port, () => {
  console.log("🚀 Server listening on: http://localhost:" + port);
  // Start the keep-alive mechanism
  setupKeepAlive();
});

startvoxmd();

module.exports = startvoxmd 

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
}); 
