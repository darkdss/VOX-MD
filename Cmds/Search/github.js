module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) return m.reply("Provide a GitHub username to fetch profile!");

        const response = await fetch(`https://api.github.com/users/${text}`);
        if (!response.ok) throw new Error();

        const data = await response.json();
        const reposResponse = await fetch(data.repos_url);
        const repos = await reposResponse.json();

        const pic = `https://github.com/${data.login}.png`;

        let repoStars = repos.map(repo => `⭐ ${repo.stargazers_count} - ${repo.name}`).join("\n") || "No public repositories";

        let readme = "No README found.";
        const readmeResponse = await fetch(`https://raw.githubusercontent.com/${text}/${text}/main/README.md`);
        if (readmeResponse.ok) {
            readme = await readmeResponse.text();
            readme = readme.length > 500 ? readme.substring(0, 500) + "..." : readme;
        }

        const userInfo = `
💎GITHUB USER INFO💎

♦️ Name: ${data.name || "Not available"}
🔖 Username: ${data.login}
✨ Bio: ${data.bio || "Not available"}
🏢 Company: ${data.company || "Not available"}
📍 Location: ${data.location || "Not available"}
📧 Email: ${data.email || "Not available"}
📰 Blog: ${data.blog || "Not available"}
🔓 Public Repo: ${data.public_repos}
📅 Joined GitHub: ${new Date(data.created_at).toDateString()}
👪 Followers: ${data.followers}
🫶 Following: ${data.following}

⭐ REPOSITORIES & STARS ⭐
${repoStars}

📜 README (if available):
${readme}
`;

        await client.sendMessage(m.chat, { image: { url: pic }, caption: userInfo }, { quoted: m });

    } catch (e) {
        m.reply("I did not find that user, try again.");
    }
};
