import {Client, GatewayIntentBits} from 'discord.js';
import dotenv from 'dotenv';
import cron from 'node-cron';

import * as fs from 'fs';

import {handleCommands, registerCommands} from './commands';
import {checkinAllUsers} from './hoyolab/checkinAllUsers';

dotenv.config();

export interface User {
    username: string;
    discord_id: string;
    profiles: Profile[];
}

// Create profile object
export interface Profile {
    nickname: string;
    genshin: UID[];
    hk_str: UID[];
    hk_imp: UID[];
    zzz: UID[];
    pasted_cookie: Record<string, string>;
    raw_cookie: string;
}

// Create uid object for user's profiles
export interface UID {
    region: string;
    region_name: string;
    gameUid: number;
    nickname: string;
    level: number;
}

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

// When ready
client.on('ready', async () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    console.log(getTime());
    // Register slash commands
    await registerCommands(CLIENT_ID, TOKEN);
    handleCommands(client);

    await scheduleDailyTask(12, 7);

    console.log('Bot is ready')

});

// File functions

// Function to read and parse the JSON file
export function readUsersFromFile(): User[] {
    const filePath: string = './users.json';
    try {
        const fileContent: string = fs.readFileSync(filePath, 'utf8');
        const jsonData: User[] = JSON.parse(fileContent).users;

        if (Array.isArray(jsonData)) {
            return jsonData;
        } else {
            console.error('Invalid JSON structure. Expected property "users" to be an array.');
            return [];
        }
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        return [];
    }
}

// Get user by discordID
export function getUserByDiscordID(discordID: string): User | undefined {
    const users: User[] = readUsersFromFile();
    return users.find(user => user.discord_id === discordID);
}

// Get all profiles by discord ID
export function getProfilesByDiscordID(discordID: string): Profile[] | undefined {
    const users: User[] = readUsersFromFile();
    return users.find(user => user.discord_id === discordID)?.profiles || [];
}

// Set JSON file users array
function writeUsersToFile(users: User[]): void {
    const jsonData = { users };
    fs.writeFileSync('./users.json', JSON.stringify(jsonData, null, 2), 'utf8');
}

// Add a new user to the JSON file
export function upsertUser(newUser: User): void {
    const users: User[] = readUsersFromFile();
    const existingUserIndex = users.findIndex(user => user.discord_id === newUser.discord_id);

    if (existingUserIndex > -1) {
        users[existingUserIndex] = newUser;
    } else {
        users.push(newUser);
    }

    writeUsersToFile(users);
}

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

client.login(TOKEN);

// to shut down do 
// ps aux
// then kill the node process