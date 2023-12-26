import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { parseExpression } from 'cron-parser';

import * as fs from 'fs';

import { commands, handleCommands, registerCommands } from './commands';
import { checkInAllUsers } from './checkin';
import { getUserGenshinInfo } from './genshin/getUserGenshinInfo';
import { redeemGenshinCode } from './genshin/redeemCode';

dotenv.config();

export interface UID {
    region: string;
    gameUid: any;
}

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
    
    // Register slash commands
    await registerCommands(CLIENT_ID, TOKEN);
    handleCommands(client);

    // Schedule the task to run every day at 12:07 PM
    const cronExpression = '7 12 * * *';
    const interval = parseExpression(cronExpression);
    interval.next();

    setInterval(async () => {
        console.log('Running checkInAllUsers at 12:07 PM');
        await checkInAllUsers();
    }, interval.next().getTime() - Date.now());

    //const token = '_MHYUUID=df320a7d-6f52-4092-80bc-ef24dc890967; mi18nLang=en-us; DEVICEFP_SEED_ID=298835e741fd8e99; DEVICEFP_SEED_TIME=1703372478144; DEVICEFP=38d7f00e59d0c; HYV_LOGIN_PLATFORM_OPTIONAL_AGREEMENT={%22content%22:[]}; cookie_token_v2=v2_CAQSDGM5b3FhcTNzM2d1OBokZGYzMjBhN2QtNmY1Mi00MDkyLTgwYmMtZWYyNGRjODkwOTY3IIruqKwGKMLh0zgw8O_UP0ILYmJzX292ZXJzZWE; account_mid_v2=1i2lg7l14p_hy; account_id_v2=133511152; ltoken_v2=v2_CAISDGM5b3FhcTNzM2d1OBokZGYzMjBhN2QtNmY1Mi00MDkyLTgwYmMtZWYyNGRjODkwOTY3IIruqKwGKPuXm6sCMPDv1D9CC2Jic19vdmVyc2Vh; ltmid_v2=1i2lg7l14p_hy; ltuid_v2=133511152; HYV_LOGIN_PLATFORM_LOAD_TIMEOUT={}; HYV_LOGIN_PLATFORM_TRACKING_MAP={}; HYV_LOGIN_PLATFORM_LIFECYCLE_ID={%22value%22:%229a9d60ea-d64f-432d-9628-893b484c3e0c%22}';
    //await getUserGenshinInfo(token);


    //await redeemCode(token ,'GENSHINGIFT', '625643840', 'Nick');

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

// Function to get a user by user_id
export function getUserById(users: User[], targetUserId: string): User | undefined {
    return users.find(user => user.user_id === targetUserId);
}

// Function to add a user to the users file
function writeUsersToFile(filePath: string, users: User[]): void {
    const jsonData = { users };
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
}

// Function to add a new user to the JSON file
export function addNewUserToFile(filePath: string, newUser: User): void {
    const users = readUsersFromFile(filePath);
    users.push(newUser);
    writeUsersToFile(filePath, users);
}


client.login(TOKEN);
