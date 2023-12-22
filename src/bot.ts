import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

import { commands, registerCommands } from './commands.js';

dotenv.config();

// Create client object and list intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
]});

// Process environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if(!TOKEN || !CLIENT_ID){
    console.error('Error loading environment variables');
    process.exit(1)
}


client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log('Testing nodemon');
  
    
    await registerCommands(CLIENT_ID, TOKEN);
  });


// Create commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
}); 

client.login(TOKEN);
