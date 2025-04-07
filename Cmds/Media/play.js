const axios = require("axios");
const ytSearch = require("yt-search");

module.exports = async (context) => {
    const { client, m, text } = context;

    if (!text) return m.reply("❌ What song do you want to download?");

    await m.reply("🔄 *VOX MD Bot is fetching your audio... Please wait...*");

    try {
        let search = await ytSearch(text);
        let video = search.videos[0];

        if (!video) return m.reply("❌ No results found. Please refine your search.");

        let link = video.url;
        let apis = [
        `https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${encodeURIComponent(link)}&quality=128kbps&server=server2`,
            `https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${encodeURIComponent(link)}&quality=128kbps&server=auto`,
            `https://fastrestapis.fasturl.cloud/downup/ytmp3?url=${encodeURIComponent(link)}&quality=128kbps&server=server1`
        ];

        async function fetchWithRetry(apiList, retries = 3, delay = 5000) {
            for (let api of apiList) {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await axios.get(api, { timeout: 30000, headers: { "accept": "application/json" } });
                        if (response.data && response.data.status === 200) {
                            return response.data.result;
                        }
                        throw new Error("Invalid API response");
                    } catch (error) {
                        console.error(`Attempt ${i + 1} failed for ${api}: ${error.message}`);
                        if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
                    }
                }
            }
            throw new Error("Failed to fetch song data after multiple attempts.");
        }

        let data = await fetchWithRetry(apis);

        let songData = {
            title: data.title,
            artist: data.author.name,
            thumbnail: data.metadata.thumbnail,
            videoUrl: data.url,
            audioUrl: data.media
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
                audio: { url: songData.audioUrl },
                mimetype: "audio/mp4",
            },
            { quoted: m }
        );

        // Send as a document file
        await client.sendMessage(
            m.chat,
            {
                document: { url: songData.audioUrl },
                mimetype: "audio/mp3",
                fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
            },
            { quoted: m }
        );

        // Send success message
        await m.reply("✅ *Successfully sent! 🎶*");

    } catch (error) {
        console.error("Error:", error.message);
        return m.reply("❌ Download failed\n" + error.message);
    }
};