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

    try {
        // Notify the user that upload is starting
        await client.sendMessage(m.chat, {
            text: "⏳ *Uploading your media... Please wait!*"
        });

        // Download the media
        let mediaBuffer = await q.download();
        if (!mediaBuffer) throw new Error("❌ *Failed to download media!*");

        // Create a temporary file
        let filePath = `./temp_${Date.now()}.${mime.split("/")[1]}`;
        fs.writeFileSync(filePath, mediaBuffer);

        // Prepare form data
        let formData = new FormData();
        formData.append("file", fs.createReadStream(filePath), {
            filename: filePath.split("/").pop(),
            contentType: mime
        });

        // Upload the media
        const response = await fetch("https://fastrestapis.fasturl.cloud/downup/uploader-v1", {
            method: "POST",
            headers: { accept: "application/json" },
            body: formData
        });

        const result = await response.json();
        fs.unlinkSync(filePath); // Delete temporary file

        if (result.status !== 200 || !result.result) {
            throw new Error("❌ *Failed to upload media!* API did not return a valid response.");
        }

        // Construct response message
        const mediaUrl = result.result;
        const caption = `🌍 *Upload Successful!*\n\n🔗 *URL:* ${mediaUrl}\n\n✨ _Powered by VOX-MD_`;

        // Send the response
        await client.sendMessage(m.chat, { text: caption }, { quoted: m });

    } catch (error) {
        console.error("Upload Error:", error.message);
        m.reply(`❌ *Error:* ${error.message}`);
    }
};