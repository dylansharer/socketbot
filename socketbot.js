const Discord = require('discord.js');
const bot = new Discord.Client();
const fs = require('fs');
bot.commands = new Discord.Collection();

const config = require('./config.js');

fs.readdir('./commands', (err, files) => {
    if(err) return console.log(err);

    let jsfile = files.filter(file => file.split(".").pop() === 'js');

    if (jsfile.length <= 0) return console.log("No commands found!")

    jsfile.forEach(file => {
        let props = require(`./commands/${file}`); // './commands/socials.js'
        bot.commands.set(props.help.name, props);
    })
})

const prefix = '-';

// this runs when you receive a message
bot.on('message', (message) => {
    if(message.author.bot) return;
    if(message.channel.type !== 'text') return;

    //console.log('Message received', message.content)

    let MessageArray = message.content.split(' ');
    let cmd = MessageArray[0].slice(prefix.length) // opensea
    let args = MessageArray.slice(1) // []

    if(!message.content.startsWith(prefix)) return;

    let commandfile = bot.commands.get(cmd);

    if(commandfile) {
        commandfile.run(bot, message, args);
    }
});



bot.once('ready', () => {
    console.log('SocketBot is online!');
});


bot.on('guildMemberAdd', async newMember => {
    const welcomeChannel = newMember.guild.channels.cache.find(channel => channel.name === '👋welcome')

    let msgEmbed = new Discord.MessageEmbed()
    .setTitle (`Welcome @${newMember.user.username}!`)
    .setColor('#007b5a')
    .setThumbnail(newMember.user.avatarURL())
    .setDescription(`Welcome to the official Sockets server!\nMake sure to check out the rules and social channels!\n**Current Member Count:** ${newMember.guild.memberCount}`)
    .setFooter(newMember.guild.name, newMember.guild.iconURL())
    welcomeChannel.send(msgEmbed)

})
bot.on('guildMemberAdd', guildMember =>{
    let welcomeRole = guildMember.guild.roles.cache.find(role => role.name === 'Member');
    if (guildMember.bot) return;
    guildMember.roles.add(welcomeRole);
});

bot.login(config.discordToken); 

