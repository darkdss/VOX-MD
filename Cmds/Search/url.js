const axios = require('axios'); const FormData = require('form-data'); const fs = require('fs'); const path = require('path');

module.exports = async function uploadFile(filePath) { const form = new FormData(); const fileType = path.extname(filePath).toLowerCase(); let contentType;

switch (fileType) {
    case '.jpg':
    case '.jpeg':
        contentType = 'image/jpeg';
        break;
    case '.png':
        contentType = 'image/png';
        break;
    case '.gif':
        contentType = 'image/gif';
        break;
    case '.mp4':
        contentType = 'video/mp4';
        break;
    case '.mov':
        contentType = 'video/quicktime';
        break;
    default:
        throw new Error('Unsupported file format');
}

form.append('url', fs.readFileSync(filePath).toString('base64'), {
    filename: path.basename(filePath),
    contentType,
});

try {
    const response = await axios.post(
        'https://fastrestapis.fasturl.cloud/downup/uploader-v1',
        form,
        {
            headers: {
                ...form.getHeaders(),
                'accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    
    if (response.status === 200) {
        return response.data;
    } else {
        throw new Error(`Unexpected response status: ${response.status}`);
    }
} catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
    throw error;
}

};

