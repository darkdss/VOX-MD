const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, botname, m, text, fetchJson } = context;

    const fetchFacebookData = async (url, retries = 3) => {
        for (let attempt = 0; attempt < retries; attempt++) {
            const data = await fetchJson(url);
            if (data && data.status === 200 && data.result && data.result.sd) {
                return data.result;
            }
        }
        throw new Error("Failed to fetch valid Facebook video data after multiple attempts.");
    };

    try {
        if (!text) return m.reply("Provide a Facebook link for the video.");
        if (!text.includes("facebook.com")) return m.reply("That is not a valid Facebook link.");

        const url = `https://fastrestapis.fasturl.cloud/downup/fbdown?url=${encodeURIComponent(text)}`;
        const data = await fetchFacebookData(url);

        const fbVideoUrl = data.sd || data.hd || "";
        if (!fbVideoUrl) throw new Error("No downloadable video found.");

        const fbTitle = data.title || "No title available";
        const fbThumbnail = data.thumbnail || "";
        
        const caption = `📹 *Facebook Video*\n\n📌 *Title:* ${fbTitle}\n🔗 *Original Link:* ${data.url}`;

        m.reply("Facebook video data fetched successfully! Sending...");

        const response = await fetch(fbVideoUrl);
        if (!response.ok) {
            throw new Error(`Failed to download video: HTTP ${response.status}`);
        }

        const videoBuffer = Buffer.from(await response.arrayBuffer());

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption,
            thumbnail: fbThumbnail ? { url: fbThumbnail } : null
        }, { quoted: m });

    } catch (error) {
        m.reply(`Error: ${error.message}`);
    }
};