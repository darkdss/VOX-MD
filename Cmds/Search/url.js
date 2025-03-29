const fetch = require("node-fetch");
const FormData = require("form-data"); const fs = require("fs"); const path = require("path");

module.exports = async (context) => { const { client, m, text, quoted } = context;

try {
    if (!text || text !== ".url") return; // Ensure it only triggers on ".url"
    
    if (!quoted || !quoted.mimetype) {
        return m.reply("Reply to an image, audio, video, GIF, or WebP with .url to upload.");
    }
    
    const media = await quoted.download();
    const fileType = quoted.mimetype.split("/")[1];
    const filePath = `./tempfile.${fileType}`;
    fs.writeFileSync(filePath, media);
    
    const allowedTypes = ["jpeg", "jpg", "png", "gif", "webp", "mp4", "mp3", "wav", "ogg"];
    if (!allowedTypes.includes(fileType)) {
        fs.unlinkSync(filePath);
        return m.reply("Unsupported file type.");
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath), {
        filename: path.basename(filePath),
        contentType: quoted.mimetype
    });

    const response = await fetch("https://fastrestapis.fasturl.cloud/downup/uploader-v1", {
        method: "POST",
        headers: formData.getHeaders(),
        body: formData
    });

    fs.unlinkSync(filePath);
    
    if (!response.ok) {
        throw new Error(`Failed to upload file: HTTP ${response.status}`);
    }

    const result = await response.json();
    if (!result || !result.url) {
        throw new Error("Invalid response from server.");
    }
    
    await client.sendMessage(m.chat, { text: `🌐 *Uploaded File URL:* ${result.url}` }, { quoted: m });
} catch (error) {
    console.error("Upload error:", error.message);
    m.reply(`Error: ${error.message}`);
}

};

