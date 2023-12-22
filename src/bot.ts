import {  REST, Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();


const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
] });

const TOKEN = process.env.TOKEN;

if(!TOKEN){
    console.error('Error loading bot token');
    process.exit(1)
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on('messageCreate', (message) => {
  // Your bot's logic goes here
  if (message.content.toLowerCase() === 'ping') {
    message.reply('Pong!');
  }
});

client.login(TOKEN);
