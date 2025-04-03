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

    // If primary API fails, use the fallback API
    if (!response) {
        try {
            const fallbackUrl = `https://api.dreaded.site/api/chatgpt?text=${encodeURIComponent(text)}`;
            const fallbackData = await fetchJson(fallbackUrl);

            // Check if the fallback API has a non-empty response
            if (fallbackData && fallbackData.result && fallbackData.result.trim() !== "") {
                response = fallbackData.result;
            } else {
                console.log("Fallback API returned empty or invalid data:", fallbackData);
            }
        } catch (error) {
            console.log("Fallback API error:", error);
        }
    }

    // Send the response with a delay
    if (response) {
        setTimeout(async () => {
            await m.reply(response);
        }, Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000); // Random delay 2-4 seconds
    } else {
        m.reply("Sorry, I couldn't process your request. The AI response was empty.");
    }
};
