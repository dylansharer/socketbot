require('dotenv').config();

const config = {
    discordToken: process.env.DISCORD_TOKEN,
    discordChannelId: process.env.DISCORD_CHANNEL_ID
};

module.exports = config;