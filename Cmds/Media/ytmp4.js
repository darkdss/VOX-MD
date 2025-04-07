const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, botname, m, text, fetchJson } = context;

    const fetchYouTubeData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (data && data.status === 200 && data.result && data.result.media) {
                return data.result; // Extract relevant YouTube video data
            }
        }
        throw new Error("Failed to fetch valid YouTube video data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide a YouTube video link.");
        if (!text.includes("youtube.com") && !text.includes("youtu.be")) return m.reply("That is not a valid YouTube link.");

        const url = `https://fastrestapis.fasturl.cloud/downup/ytmp4?url=${encodeURIComponent(text)}&quality=720&server=auto`;
        const data = await fetchYouTubeData(url);

        const videoUrl = data.media || "";
        if (!videoUrl) throw new Error("No downloadable video found.");

        const thumbnail = data.metadata?.thumbnail || "";
        const title = data.title || "YouTube Video";
        const duration = data.metadata?.duration || "Unknown";
        const views = data.metadata?.views || "Unknown";
        const uploadDate = data.metadata?.uploadDate || "Unknown";
        const author = data.author?.name || "Unknown";

        const caption = `🎥 *YouTube Video*\n\n📌 *Title:* ${title}\n🕒 *Duration:* ${duration}\n👁️ *Views:* ${views}\n📅 *Uploaded:* ${uploadDate}\n🎤 *Channel:* ${author}\n🔗 *Original Link:* ${text}`;

        m.reply("YouTube video data fetched successfully! Sending...");

        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw new Error(`Failed to download video: HTTP ${response.status}`);
        }

        const videoBuffer = Buffer.from(await response.arrayBuffer());

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption,
            thumbnail: thumbnail ? { url: thumbnail } : null
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};