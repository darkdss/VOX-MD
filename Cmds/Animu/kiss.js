const axios = require('axios');

module.exports = async (context) => {
const { client, m, args } = context;

try {  
    // Fetch hug GIF from API  
    const response = await axios.get('https://api.waifu.pics/sfw/kiss');  
    const hugGifUrl = response.data.url; // FIXED: Correct response property  

    // Get mentioned user  
    const mentionedUser = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]);  
    const sender = m.sender;  

    // Format message  
    let messageText = "";  
    if (mentionedUser) {  
        const mentionedName = await client.getName(mentionedUser);  
        messageText = `😘 *${m.pushName}* gives a big kiss to *${mentionedName}*! 💖`;  
    } else {  
        messageText = `😘 *${m.pushName}* kiss themselves! 🤍`;  
    }  

    // Send hug GIF with caption  
    await client.sendMessage(m.chat, {  
        image: { url: hugGifUrl },  
        caption: messageText,  
    }, { quoted: m });  

} catch (error) {  
    console.error("Error fetching hug GIF:", error);  
    m.reply("❌ Failed to fetch hug GIF. Please try again later!");  
}

};


