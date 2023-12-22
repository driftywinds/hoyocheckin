import {  REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Create client object and list intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
] });

// Process environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if(!TOKEN || !CLIENT_ID){
    console.error('Error loading environment variables');
    process.exit(1)
}

// Handle commands
const commands = [
{
    name: 'ping',
    description: 'Replies with Pong!',
},
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
  

client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
    console.log('Testing nodemon');
});


// Create commands
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
    }
}); 

client.login(TOKEN);
