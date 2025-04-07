const { DateTime } = require('luxon'); const fs = require('fs'); const path = require('path');

module.exports = async (context) => { const { client, m, botname, prefix } = context;

try {
    const categories = [
        { name: 'AI', emoji: '💫' },
        { name: 'Image Ai', emoji: '🦸' },
        { name: 'Glow Text', emoji: '💎' },
        { name: 'General', emoji: '✍️' },
        { name: 'Tools Ai', emoji: '⚒️' },
        { name: 'Logo', emoji: '🖼️' },
        { name: 'Animu', emoji: '🐺' },
        { name: 'Media', emoji: '🎥' },
        { name: 'Search', emoji: '🔍' },
        { name: 'Editting', emoji: '✂️' },
        { name: 'Groups', emoji: '👥' },
        { name: 'Owner', emoji: '👑' },
        { name: 'Coding', emoji: '💻' },
        { name: 'Utils', emoji: '🎭' }
    ];

    const getThumbnail = () => {
        const assetsPath = path.join(__dirname, '../../Voxmdgall');
        if (!fs.existsSync(assetsPath)) return null;
        const images = fs.readdirSync(assetsPath).filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));
        return images.length ? fs.readFileSync(path.join(assetsPath, images[Math.floor(Math.random() * images.length)])) : null;
    };

    const selectedCategoryIndex = parseInt(m.body.trim()) - 1;
    const selectedCategory = categories[selectedCategoryIndex];

    if (!selectedCategory || isNaN(selectedCategoryIndex)) {
        let categoryMenu = `📌 *SELECT A CATEGORY:*\n\n`;
        categories.forEach((cat, index) => {
            categoryMenu += `${index + 1}. ${cat.emoji} *${cat.name}*\n`;
        });
        categoryMenu += `\n💠 *Reply with a number to choose a category.*`;

        const thumbnail = getThumbnail();
        return await client.sendMessage(m.chat, {
            image: thumbnail,
            caption: categoryMenu
        }, { quoted: m });
    }

    const categoryPath = path.join(__dirname, `../${selectedCategory.name}`);
    if (!fs.existsSync(categoryPath)) return m.reply('❌ No commands found for this category.');

    const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
    let commandList = `⭐ *${selectedCategory.name.toUpperCase()} COMMANDS* ${selectedCategory.emoji}\n\n`;
    commandFiles.forEach(file => {
        const commandName = file.replace('.js', '');
        commandList += `➤ 🔹 *${prefix}${commandName}*\n`;
    });

    const thumbnail = getThumbnail();
    await client.sendMessage(m.chat, {
        image: thumbnail,
        caption: commandList
    }, { quoted: m });

} catch (error) {
    console.error(error);
    m.reply('❌ An error occurred while fetching the menu.');
}

};

         
