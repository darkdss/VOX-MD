module.exports = async (context) => {
    const { client, m, text, botname, fetchJson } = context;

    if (!text) {
        return m.reply("Provide some text or query for ChatGPT.");
    }

    try {
        // First attempt with primary API
        let data = await fetchJson(`https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`);

        // If primary API fails or has no valid result, use fallback API
        if (!data || !data.result) {
            data = await fetchJson(`https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`);
        }

        // Final response handling
        if (data && data.result) {
            const res = data.result;

            // Introduce a delay to prevent instant responses and reduce spam risk
            setTimeout(async () => {
                await m.reply(res);
            }, Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000); // Random delay between 2-4 seconds
        } else {
            m.reply("Invalid response from both APIs.");
        }
    } catch (error) {
        m.reply("Something went wrong...\n\n" + error);
    }
};
