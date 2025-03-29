const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

module.exports = async (context) => {
    const { client, m } = context;

    // Check if media is quoted
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";

    if (!mime) {
        return m.reply("❌ *Reply to an image or video to generate a URL!*");
    }

    // Notify user that upload is in progress
    await client.sendMessage(m.chat, { text: "⏳ *Uploading your media... Please wait!*" });

    let filePath;
    try {
        // Download media
        let mediaBuffer = await q.download();
        if (!mediaBuffer) throw new Error("❌ *Failed to download media!*");

        // Create a temporary file
        filePath = createTempFile(mediaBuffer, mime);

        // Upload media and get URL
        const mediaUrl = await uploadMedia(filePath, mime);

        // Construct response message
        const caption = `🌍 *Upload Successful!*\n\n🔗 *URL:* ${mediaUrl}\n\n✨ _Powered by VOX-MD_`;

        // Send the response
        await client.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (error) {
        console.error("Upload Error:", error);
        m.reply(`❌ *Error:* ${error.message}`);
    } finally {
        // Ensure temporary file is deleted
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

function createTempFile(buffer, mime) {
    let extension = mime.split("/")[1] || "tmp";
    let filePath = `./temp_${Date.now()}.${extension}`;
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

async function uploadMedia(filePath, mime) {
    let formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
        filename: filePath.split("/").pop(),
        contentType: mime
    });

    const response = await fetch("https://fastrestapis.fasturl.cloud/downup/uploader-v1", {
        method: "POST",
        headers: { accept: "application/json" },
        body: formData
    });

    const result = await response.json();

    if (!result || result.status !== 200 || !result.result) {
        throw new Error("❌ *Failed to upload media!* API error.");
    }

    return result.result;
}