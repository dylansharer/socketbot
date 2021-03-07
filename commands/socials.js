module.exports.run = async (_client, message, _args) => {
    message.channel.send(`https://opensea.io/collection/sockets`);
    message.channel.send(`https://twitter.com/SocketsNFT`);
    message.channel.send(`https://www.reddit.com/user/SocketsNFT`);
}
  
module.exports.help = {
    name: 'socials'
}