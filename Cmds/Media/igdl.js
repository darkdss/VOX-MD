const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, botname, m, text, fetchJson } = context;

    const fetchInstagramData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (data && data.status === 200 && data.result && data.result.data && data.result.data.length > 0) {
                return data.result.data[0];  // Extract the first video from the response array
            }
        }
        throw new Error("Failed to fetch valid Instagram video data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide an Instagram link for the video.");
        if (!text.includes("instagram.com")) return m.reply("That is not a valid Instagram link.");

        const url = `https://fastrestapis.fasturl.cloud/downup/igdown?url=${encodeURIComponent(text)}`;
        const data = await fetchInstagramData(url);

        const igVideoUrl = data.url || "";
        if (!igVideoUrl) throw new Error("No downloadable video found.");

        const igThumbnail = data.thumbnail || "";
        
        const caption = `📹 *Instagram Video*\n\n🔗 *Original Link:* ${text}`;

        m.reply("Instagram video data fetched successfully! Sending...");

        const response = await fetch(igVideoUrl);
        if (!response.ok) {
            throw new Error(`Failed to download video: HTTP ${response.status}`);
        }

        const videoBuffer = Buffer.from(await response.arrayBuffer());

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption,
            thumbnail: igThumbnail ? { url: igThumbnail } : null
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};
