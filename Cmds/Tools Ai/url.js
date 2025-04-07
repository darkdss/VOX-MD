const path = require("path");
const fs = require("fs").promises;
const uploadToImgur = require(path.join(__dirname, "../../lib/Imgur.js"));

module.exports = async (context) => {
    const { client, m, quoted, uploadToimgur } = context;

    console.log("Processing URL command...");

    let q = quoted ? quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!mime) {
        console.log("No media found!");
        return m.reply("✳️ *Please respond to an image or video!*");
    }

    try {
        console.log("Downloading media...");
        let mediaBuffer = await q.download();
        console.log("Media downloaded!");

        if (mediaBuffer.length > 10 * 1024 * 1024) {
            console.log("Media size exceeds 10MB.");
            return m.reply("❌ *Media size exceeds 10 MB.* Please upload a smaller file.");
        }

        let tmpDir = path.join(__dirname, "../../tmp");
        await fs.mkdir(tmpDir, { recursive: true });

        let mediaExt = mime.split("/")[1] || "tmp";
        let mediaPath = path.join(tmpDir, `media_${Date.now()}.${mediaExt}`);
        await fs.writeFile(mediaPath, mediaBuffer);
        console.log("Media saved to:", mediaPath);

        let isImageOrVideo = /image\/(png|jpe?g|gif)|video\/mp4/.test(mime);

        if (isImageOrVideo) {
            console.log("Uploading to Imgur...");
            let link = await uploadToImgur(mediaPath);
            console.log("Upload successful!", link);

            const fileSizeMB = (mediaBuffer.length / (1024 * 1024)).toFixed(2);
            await client.sendMessage(m.chat, {
                text: `✅ *Media Upload Successful!*\n\n📁 *File Size:* ${fileSizeMB} MB\n🔗 *URL:* ${link}\n\n✨ _Powered by VOX-MD_`
            });

            // Delete temp file after successful upload
            await fs.unlink(mediaPath);
            console.log("Temporary file deleted!");
        } else {
            await client.sendMessage(m.chat, { text: `♕ ${mediaBuffer.length} Byte(s)\n♕ (Unknown Format)` });
        }

    } catch (error) {
        console.error("Media upload error:", error.message);
        m.reply("❌ *Failed to process your media!* Please try again later.");
    }
};
