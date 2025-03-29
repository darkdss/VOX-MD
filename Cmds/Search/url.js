const axios = require("axios"); const FormData = require("form-data"); const fs = require("fs"); const path = require("path");

const UPLOAD_URL = "https://fastrestapis.fasturl.cloud/downup/uploader-v1";

module.exports = async (context) => { const { client, m, quoted, text } = context;

if (!text || text !== ".url") return;
if (!quoted || !quoted.mimetype) {
    return m.reply("❌ Please reply to an image, audio, video, GIF, or WebP with .url to upload and get a link.");
}

await m.reply("🔄 *Uploading file... Please wait...* ");

try {
    const media = await quoted.download();
    const fileType = quoted.mimetype.split("/")[1];
    const filePath = `./tempfile.${fileType}`;
    fs.writeFileSync(filePath, media);

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: quoted.mimetype
    });

    let response = await axios.post(UPLOAD_URL, formData, {
        headers: formData.getHeaders(),
    });

    fs.unlinkSync(filePath);

    if (!response.data || !response.data.url) {
        return m.reply("❌ Upload failed. Please try again later.");
    }

    let fileUrl = response.data.url;
    let fileMessage = `🌐 *Uploaded File URL:* ${fileUrl}`;

    await m.reply(fileMessage);
} catch (error) {
    console.error("Upload Error:", error.message);
    return m.reply("⚠️ An error occurred while uploading. Please try again later.");
}

};

