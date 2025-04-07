const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, botname, m, text, fetchJson } = context;

    const fetchTikTokData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (data && data.status === 200 && data.result && data.result.media && data.result.media.videoUrl) {
                return data.result;
            }
        }
        throw new Error("Failed to fetch valid TikTok data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide a TikTok link for the video.");
        if (!text.includes("tiktok.com")) return m.reply("That is not a valid TikTok link.");

        const url = `https://fastrestapis.fasturl.cloud/downup/ttdown?url=${text}`;
        const data = await fetchTikTokData(url);

        const tikVideoUrl = data.media.videoUrl;
        const tikDescription = data.title || "No description available";
        const tikAuthor = data.author || "Unknown Author";
        const tikLikes = data.likes || "0";
        const tikComments = data.comments || "0";
        const tikShares = data.shares || "0";

        const caption = `🎥 *TikTok Video*\n\n📌 *Description:* ${tikDescription}\n👤 *Author:* ${tikAuthor}\n❤️ *Likes:* ${tikLikes}\n💬 *Comments:* ${tikComments}\n🔗 *Shares:* ${tikShares}`;

        m.reply("TikTok data fetched successfully! Sending...");

        const response = await fetch(tikVideoUrl);
        if (!response.ok) {
            throw new Error(`Failed to download video: HTTP ${response.status}`);
        }

        const videoBuffer = Buffer.from(await response.arrayBuffer());

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption,
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};