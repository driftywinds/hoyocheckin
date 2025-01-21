import {Client, GatewayIntentBits, Interaction} from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

import {checkinAllUsers} from './hoyolab/checkinAllUsers';
import {connectToDatabase} from "./database/dbConnection";
import {handleButtonInteraction} from "./interactions/buttons";
import {handleCommands, registerCommands} from './interactions/commands';
import {handleModalSubmit} from "./interactions/modalSubmit";
import {handleStringSelectInteraction} from "./interactions/stringSelect";


// Create client object and list intents
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.DirectMessages
]});

// Process environment variables
const environment: string = process.argv[2] || 'development';
dotenv.config({ path: `.env.${environment}` });

console.log(`Loaded environment file: .env.${environment}`);

// Bot environment variables
export const config = {
    TOKEN: process.env.TOKEN || '',
    CLIENT_ID: process.env.CLIENT_ID || '',
    BOT_ADMIN_ID: process.env.BOT_ADMIN_ID || '',
    MONGO_URI: process.env.MONGO_URI || '',
    DATABASE_NAME: process.env.DATABASE_NAME || '',
}

if(!config.TOKEN || !config.CLIENT_ID || !config.BOT_ADMIN_ID || !config.MONGO_URI || !config.DATABASE_NAME){
    console.error('Missing environment variables');
    process.exit(1);
}

// When ready
client.on('ready', async () => {
    // Connect to MongoDB
    console.log('Initializing database connection...');
    await connectToDatabase(config.MONGO_URI, config.DATABASE_NAME);
    console.log('Database connection established.');

    // Register slash commands
    console.log('Registering slash commands...');
    await registerCommands(config.CLIENT_ID, config.TOKEN);
    console.log('Slash commands registered.');

    handleInteractions(client);

    // Schedule Daily checkin task
    console.log('Scheduling daily check-in task...');
    await scheduleDailyTask(12, 7);
    console.log('Daily check-in task scheduled.');
});

// Timing functions

// Function to schedule a task at a specific time every day
async function scheduleDailyTask(hour: number, minute: number) {
    const time = `${minute} ${hour} * * *`;

    cron.schedule(time, async () => {
        console.log(`Task running at ${hour}:${minute}`);
        await checkinAllUsers();
    }, {
        scheduled: true,
        timezone: "America/New_York" 
    });
}

export function getTime(): string {
    const timestamp = Date.now();
    const date = new Date(timestamp);

    // Use Date methods to format the date and time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

}

client.login(config.TOKEN).then(() => {
    console.log(`[${getTime()}] Logged in as ${client.user?.tag}!`);
});

// Interaction Handling

export const handleInteractions = (client: Client): void => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (interaction.isButton()){
            await handleButtonInteraction(interaction);
        }else if(interaction.isCommand()){
            await handleCommands(interaction);
        }else if(interaction.isModalSubmit()){
            await handleModalSubmit(interaction);
        }else if(interaction.isStringSelectMenu()){
            await handleStringSelectInteraction(interaction);
        }
    });
}