import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { parseExpression } from 'cron-parser';

import * as fs from 'fs';

import { commands, handleCommands, registerCommands } from './commands';
import { checkinAllUsers } from './hoyolab/checkinAllUsers';

dotenv.config();

// Create uid object for user's profiles
export interface UID {
    region: string;
    region_name: string;
    gameUid: any;
    nickname: string;
    level: number;
}

// Create user object
export interface User{
    username: string;
    user_id: string;
    genshin: UID[];
    h_star_rail: UID[];
    h_impact: UID[];
    pasted_cookie: Record<string, string>;
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

    const cronExpression = '7 12 * * *'; // 12:07 PM
    const intervalId = scheduleTaskAtSpecificTime(cronExpression, async () => {
        console.log('Checking all users in');
        await checkinAllUsers();
    });



});

// Function to read and parse the JSON file
export function readUsersFromFile(filePath: string): User[] {
    try {
        const fileContent: string = fs.readFileSync(filePath, 'utf8');
        const jsonData: any = JSON.parse(fileContent);

        if (Array.isArray(jsonData.users)) {
            // Assuming the array of users is stored in a property called "users"
            return jsonData.users;
        } else {
            console.error('Invalid JSON structure. Expected property "users" to be an array.');
            return [];
        }
    } catch (error) {
        console.error('Error reading or parsing the JSON file:', error);
        return [];
    }
}

// File functions

// Function to get a user by user_id
export function getUserById(users: User[], targetUserId: string): User | undefined {
    return users.find(user => user.user_id === targetUserId);
}

// Set JSON file users array
function writeUsersToFile(filePath: string, users: User[]): void {
    const jsonData = { users };
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
}

// Add a new user to the JSON file
export function addNewUserToFile(filePath: string, newUser: User): void {
    const users = readUsersFromFile(filePath);
    users.push(newUser);
    writeUsersToFile(filePath, users);
}

// Remove a user from the JSON file
export function removeUser(filePath: string, userToRemove: User): void {
    const users = readUsersFromFile(filePath);
    const updatedUsers = users.filter(user => user.user_id !== userToRemove.user_id);
    writeUsersToFile(filePath, updatedUsers);
}

// Timing functions

// Function to schedule a task at a specific time every day
const scheduleTaskAtSpecificTime = (cronExpression: string, task: () => Promise<void>, checkInterval: number = 60 * 1000) => {
    const interval = parseExpression(cronExpression);

    const runTask = async () => {
        console.log('Running scheduled task');
        await task();
    };

    const intervalId = setInterval(async () => {
        const currentTime = Date.now();
        const nextScheduledTime = interval.next().getTime();

        if (currentTime >= nextScheduledTime) {
            await runTask();
        }
    }, checkInterval);

    // Return the interval ID in case you want to stop it later
    return intervalId;
};

function getTime(): string {
    const timestamp = Date.now(); // Get the current Unix timestamp in milliseconds
    const date = new Date(timestamp);

    // Use Date methods to format the date and time components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based, so add 1 and pad with leading zeros
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Create a readable date-time string
    const readableTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    return readableTime;

}


client.login(TOKEN);
