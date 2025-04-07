const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, botname, m, text, fetchJson } = context;

    const fetchTwitterData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (data && data.status === 200 && data.result && (data.result.videohd || data.result.videosd)) {
                return data.result;  // Extract relevant Twitter video data
            }
        }
        throw new Error("Failed to fetch valid Twitter video data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide a Twitter (X) link for the video.");
        if (!text.includes("x.com") && !text.includes("twitter.com")) return m.reply("That is not a valid Twitter (X) link.");

        const url = `https://fastrestapis.fasturl.cloud/downup/twdown?url=${encodeURIComponent(text)}`;
        const data = await fetchTwitterData(url);

        const twVideoUrl = data.videohd || data.videosd || "";
        if (!twVideoUrl) throw new Error("No downloadable video found.");

        const twThumbnail = data.thumb || "";
        const twDescription = data.desc || "Twitter Video";

        const caption = `🐦 *Twitter (X) Video*\n\n📝 *Description:* ${twDescription}\n🔗 *Original Link:* ${text}`;

        m.reply("Twitter video data fetched successfully! Sending...");

        const response = await fetch(twVideoUrl);
        if (!response.ok) {
            throw new Error(`Failed to download video: HTTP ${response.status}`);
        }

        const videoBuffer = Buffer.from(await response.arrayBuffer());

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption,
            thumbnail: twThumbnail ? { url: twThumbnail } : null
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};