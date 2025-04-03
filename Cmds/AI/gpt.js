module.exports = async (context) => {
    const { client, m, text, botname, fetchJson } = context;

    if (!text) {
        return m.reply("Provide some text or query for ChatGPT.");
    }

    let response = null;

    try {
        // Try the primary API
        const primaryUrl = `https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`;
        const primaryData = await fetchJson(primaryUrl);

        if (primaryData && primaryData.result) {
            response = primaryData.result;
        }
    } catch (error) {
        console.log("Primary API failed:", error);
    }

    // If primary API fails, switch to the fallback API
    if (!response) {
        try {
            const fallbackUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
            const fallbackData = await fetchJson(fallbackUrl);

            if (fallbackData && fallbackData.result) {
                response = fallbackData.result;
            } else {
                console.log("Fallback API returned invalid data:", fallbackData);
            }
        } catch (error) {
            console.log("Fallback API error:", error);
        }
    }

    // Send the response with a slight delay
    if (response) {
        setTimeout(async () => {
            await m.reply(response);
        }, Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000); // 2-4 seconds delay
    } else {
        m.reply("Sorry, I couldn't process your request. Please try again later.");
    }
};
