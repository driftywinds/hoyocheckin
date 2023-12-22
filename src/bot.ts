import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

import { commands, handleCommands, registerCommands } from './commands';

dotenv.config();

// Create client object and list intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.DirectMessages,
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
    
    await registerCommands(CLIENT_ID, TOKEN);

    handleCommands(client);
  });


client.login(TOKEN);
