module.exports = async (context) => {
    const { client, m, dreadedspeed } = context;

    await m.reply(
        `*🏓 Pong!*\n\n` +
        `🚀 *Response Time:* \`${dreadedspeed.toFixed(4)}ms\`\n` +
        `💡 *Status:* ✅ Online & Responsive`
    );
};