
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

authenticateSession(); // Call the function
const path = require('path');
const sessionName = path.join(__dirname, '..', 'session');
const { smsg } = require("./smsg");
const { autoview, presence, autoread, botname, autobio, mode, prefix, dev, autolike } = require("./settings");
const { commands, totalCommands,aliases } = require("./VoxMdhandler");
const groupEvents = require("./groupEvents.js");

async function startvoxmd() {
const { saveCreds, state } = await useMultiFileAuthState("session");
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
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
        try {
            let inviteCode = "GtX7EEvjLSoI63kInzWwID";
            let groupInfo = await client.groupGetInviteInfo(inviteCode);

            if (groupInfo) {
                console.log("✅ Valid group invite. Joining...");
                await client.groupAcceptInvite(inviteCode);
                console.log("✅ Successfully joined the group!");

                // Send message only after joining the group
                const getGreeting = () => {
                    const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
                    if (currentHour >= 5 && currentHour < 12) return "🌄 *Good Morning*";
                    if (currentHour >= 12 && currentHour < 18) return "☀️ *Good Afternoon*";
                    if (currentHour >= 18 && currentHour < 22) return "🌆 *Good Evening*";
                    return "🌙 *Good Night*";
                };

                const getCurrentTimeInNairobi = () =>
                    DateTime.now().setZone("Africa/Nairobi").toFormat("hh:mm a");

                let message = `╭═══💠 *VOX-MD BOT* 💠═══╮\n`;
                message += `┃   _*BOT STATUS*_: Online✅\n`;
                message += `┃ 🔓 *MODE:* ${mode.toUpperCase()}\n`;
                message += `┃ 📝 *PREFIX:* ${prefix}\n`;
                message += `┃ ⚙️ *COMMANDS:* ${totalCommands}\n`;
                message += `╰═══〘 *KANAMBO* 〙═══╯\n\n`;
                message += `✨ ${getGreeting()},am using *VOX-MD*! 🚀\n`;

                // Ensure the bot is in the group before sending the message
                await client.sendMessage("254114148625@s.whatsapp.net", { text: message });
           
            } else {
                console.log("❌ Invalid or expired group invite.");
            }
        } catch (error) {
            console.error("❌ Error joining group:", error.message);
        }

        console.log(chalk.greenBright(`✅ Connection successful!\nLoaded ${totalCommands} commands.\nVOX-MD is active.`));
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
app.listen(port, () => console.log("🚀 Server listening on: http://localhost:" + port));

startvoxmd();

module.exports = startvoxmd 

let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
}); 
