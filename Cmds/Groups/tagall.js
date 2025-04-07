const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => { await middleware(context, async () => { const { client, m, args, participants, text } = context;

// 🎀 Stylish & Engaging Notification
    let txt = `🎀 *「 TAG NOTIFICATION 」* 🎀\n\n`;
    txt += `👤 *Sender:*  *${m.pushName}*\n`;
    txt += `💬 *Message:*  ${text ? `_${text}_` : '✨ No Message! ✨'}\n\n`;
    txt += `🎯 *Tagged Members:*\n`;

    // 🔖 Loop through participants & mention
    participants.forEach(mem => { 
        txt += `💌 @${mem.id.split('@')[0]}\n`;
    });

    txt += `\n💖 *Stay connected & engaged!* 💖`;

    // 🚀 Send the stylish message
    client.sendMessage(m.chat, { 
        text: txt, 
        mentions: participants.map(a => a.id) 
    }, { quoted: m }); 
});

};

