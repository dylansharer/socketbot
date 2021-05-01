import 'dotenv/config.js';
import Discord from 'discord.js';
import fetch from 'node-fetch';
import { ethers } from "ethers";
import Vibrant from 'node-vibrant';
const discordBot = new Discord.Client();

const discordSetup = async () => {
    return new Promise((resolve, reject) => {
        ['DISCORD_TOKEN', 'DISCORD_CHANNEL_ID'].forEach((envVar) => {
            if (!process.env[envVar])
                reject(`${envVar} not set`);
        });
        discordBot.login(process.env.DISCORD_TOKEN);
        discordBot.on('ready', async () => {
            const channel = await discordBot.channels.fetch(process.env.DISCORD_CHANNEL_ID);
            resolve(channel);
        });
    });
};

const buildMessage = async (sale) => {
    var _a, _b;

    const socketBackgroundHex = await Vibrant.from(sale.asset.image_url).getSwatches()
        .then(res => Object.values(res).sort((a, b) => b._population - a._population)[0].hex)
        .catch(() => "#0099ff");

    return (new Discord.MessageEmbed()
        .setColor(socketBackgroundHex)
        .setTitle(sale.asset.name + ' sold!')
        .setURL(sale.asset.permalink)
        //.setAuthor('OpenSea Bot', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png', 'https://github.com/sbauch/opensea-discord-bot')
        //.setThumbnail(sale.asset.collection.image_url)
        .addFields(
            { name: 'Name', value: sale.asset.name }, 
            { name: 'Amount', value: `${ethers.utils.formatEther(sale.total_price)}${ethers.constants.EtherSymbol}` }, 
            { name: 'Buyer', value: (_a = sale === null || sale === void 0 ? void 0 : sale.winner_account) === null || _a === void 0 ? void 0 : _a.address, }, 
            { name: 'Seller', value: (_b = sale === null || sale === void 0 ? void 0 : sale.seller) === null || _b === void 0 ? void 0 : _b.address, }
        )
        .setImage(sale.asset.image_url)
        .setTimestamp(sale.created_date) // unclear why this seems broken
        .setFooter('Sold on OpenSea', 'https://files.readme.io/566c72b-opensea-logomark-full-colored.png'));
};

async function runBot() {
    const channel = await discordSetup();

    const main = async () => {
        var _a;
        /* Give me a list sales in the last hour, can be an empty list */
        const seconds = process.env.SECONDS ? parseInt(process.env.SECONDS) : 600;
        const minsAgo = (Math.round(new Date().getTime() / 1000) - (seconds)); // in the last X mins
        
        const openSeaResponse = await fetch("https://api.opensea.io/api/v1/events?" + new URLSearchParams({
            offset: '0',
            limit: '100',
            event_type: 'successful',
            only_opensea: 'true',
            occurred_after: minsAgo.toString(),
            collection_slug: process.env.COLLECTION_SLUG,
            contract_address: process.env.CONTRACT_ADDRESS
    
        })).then((res) => res.json());

        await Promise.all((_a = openSeaResponse === null || openSeaResponse === void 0 ? void 0 : openSeaResponse.asset_events) === null || _a === void 0 ? void 0 : _a.map(async (sale) => {
            const message = buildMessage(sale);
            return channel.send(message);
        }));
    }
    
    setInterval(main, 600000); // 60000ms = 10min
}

const mockOpenSeaResponse = {
    asset: {
        name: "",
        image_url: "https://lh3.googleusercontent.com/YZzSDru7kiDziTgn1sNGI_Tbi5J6Af-DPnygeQa5Ar5Z55gktaMtfTSEC2sV5VxsAHANenWrTdDElULjLmolHQ6SI-oT1k2rtYYI=s270"
    },
    winner_account: "",
    address: "",
    seller: "",
    created_date: ""
}

runBot();

//buildMessage(mockOpenSeaResponse);