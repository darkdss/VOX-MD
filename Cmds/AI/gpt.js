module.exports = async (context) => {
    const { m, text, fetchJson } = context;

    if (!text) {
        return m.reply("Provide some text or query for ChatGPT.");
    }

    try {
        const apiUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
        const data = await fetchJson(apiUrl);

        // Validate and send response
        if (data?.result?.trim()) {
            setTimeout(() => m.reply(data.result), Math.random() * 2000 + 2000); // 2-4s delay
        } else {
            m.reply("Sorry, I couldn't process your request.");
        }
    } catch {
        m.reply("Something went wrong. Please try again later.");
    }
};
