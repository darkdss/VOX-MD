const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, args } = context;

    try {
        // Fetch kiss GIF from API
        const response = await axios.get('https://api.waifu.pics/sfw/kiss', { responseType: 'arraybuffer' });

        // Define file path
        const gifPath = path.join(__dirname, 'kiss.gif');

        // Save GIF temporarily
        fs.writeFileSync(gifPath, response.data);

        // Get mentioned user
        const mentionedUser = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]);
        let messageText = "";
        if (mentionedUser) {
            const mentionedName = await client.getName(mentionedUser);
            messageText = `😘 *${m.pushName}* gives a big kiss to *${mentionedName}*! 💖`;
        } else {
            messageText = `😘 *${m.pushName}* kisses themselves! 🤍`;
        }

        // Send GIF as a document to maintain animation
        await client.sendMessage(m.chat, {
            document: fs.readFileSync(gifPath),
            mimetype: "video/mp4",
            fileName: "kiss.gif",
            caption: messageText
        }, { quoted: m });

        // Clean up the temporary file
        fs.unlinkSync(gifPath);

    } catch (error) {
        console.error("Error fetching kiss GIF:", error);
        m.reply("❌ Failed to fetch kiss GIF. Please try again later!");
    }
};