const axios = require('axios');

module.exports = async (context) => {
    const { client, m, args } = context;

    try {
        // Fetch kiss GIF from API
        const response = await axios.get('https://api.waifu.pics/sfw/kiss');
        const kissGifUrl = response.data.url; // Correct API response property

        // Get mentioned user
        const mentionedUser = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]);
        const sender = m.sender;

        // Format message
        let messageText = "";
        if (mentionedUser) {
            const mentionedName = await client.getName(mentionedUser);
            messageText = `😘 *${m.pushName}* gives a big kiss to *${mentionedName}*! 💖`;
        } else {
            messageText = `😘 *${m.pushName}* kisses themselves! 🤍`;
        }

        // Send kiss GIF with caption
        await client.sendMessage(m.chat, {
            video: { url: kissGifUrl },
            caption: messageText,
            gifPlayback: true // Ensure GIF playback
        }, { quoted: m });

    } catch (error) {
        console.error("Error fetching kiss GIF:", error);
        m.reply("❌ Failed to fetch kiss GIF. Please try again later!");
    }
};