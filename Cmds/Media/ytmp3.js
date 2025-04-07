const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text || !text.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
        return m.reply("❌ Please provide a valid YouTube link!\n\nExample: `.ytmp3 https://youtu.be/46p-IxAVJ74?si=yL6k0SYT8qMraa2X`");
    }

    await m.reply("🔄 *VOX MD Bot is fetching your audio... Please wait...*");

    const link = text.trim();
    const apis = [
        `https://apis.davidcyriltech.my.id/youtube/mp3?url=${link}`,
        `https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${link}`,
        `https://kanambo.voxnet2025.workers.dev/downup/ytmp3?url=${link}&quality=128kbps&server=server2`,
        `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${link}`,
        `https://api.vevioz.com/api/button/mp3?url=${link}`
    ];

    async function fetchWithRetry(url, retries = 5, delay = 5000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await axios.get(url, { timeout: 30000 }); // 10s timeout
                if (response.data && (response.data.status === 200 || response.data.success)) {
                    return response.data;
                }
                throw new Error("Invalid API response structure");
            } catch (error) {
                console.error(`Attempt ${i + 1} failed for ${url}:`, error.message);
                if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
            }
        }
        throw new Error(`Failed to fetch from ${url} after ${retries} retries`);
    }

    for (const api of apis) {
        try {
            let data = await fetchWithRetry(api);
            let audioUrl = data.result?.downloadUrl || data.url;
            if (!audioUrl) throw new Error("No download URL found");

            let songData = {
                title: data.result?.title || "Unknown Title",
                artist: data.result?.author || "Unknown Artist",
                thumbnail: data.result?.image || "https://i.ytimg.com/vi/default.jpg",
                videoUrl: link
            };

            // Send metadata & thumbnail
            await client.sendMessage(
                m.chat,
                {
                    image: { url: songData.thumbnail },
                    caption: `KANAMBO THE VOX MD BOT
╭═════════════════⊷
║ 🎶 *Title:* ${songData.title}
║ 🎤 *Artist:* ${songData.artist}
╰═════════════════⊷
*Powered by VOX MD BOT*`
                },
                { quoted: m }
            );

            // Send as an audio file
            await client.sendMessage(
                m.chat,
                {
                    audio: { url: audioUrl },
                    mimetype: "audio/mp4",
                },
                { quoted: m }
            );

            // Send as a document file
            await client.sendMessage(
                m.chat,
                {
                    document: { url: audioUrl },
                    mimetype: "audio/mp3",
                    fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                },
                { quoted: m }
            );

            // Send success message
            await m.reply("✅ *Successfully sent! 🎶*");

            return; // Stop execution if successful
        } catch (e) {
            console.error(`API Error (${api}):`, e.message);
            continue; // Try next API if one fails
        }
    }

    // If all APIs fail
    return m.reply("⚠️ An error occurred. All APIs might be down or unable to process the request.");
};