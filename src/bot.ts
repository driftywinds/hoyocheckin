import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { parseExpression } from 'cron-parser';

import { commands, handleCommands, registerCommands } from './commands';
import { checkInAllUsers } from './checkin';
import { getUserInfo } from './genshin/getUserInfo';
import { redeemCode } from './genshin/redeemCode';

dotenv.config();

export interface User{
    username: string;
    user_id: string;
    genshin: string[];
    h_star_rail: string[];
    h_impact: string[];
    ltoken_v2: string;
    ltuid_v2: string;
    pasted_cookie: string;
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

    const token = 'cookie_token_v2=v2_CAQSDGNlMXRidXdiMDB6axokYjYzY2JiMjctODQ0ZS00ZWNiLTk5OTgtMmU4ZDNlNjU5MjFhIMe5qKwGKOXSmGgwnZbeP0ILaGs0ZV9nbG9iYWw; account_mid_v2=1eei29p6gb_hy; account_id_v2=133663517;';
    await getUserInfo(token);

    await redeemCode(token ,'GENSHINGIFT', '625739595', 'Bianca');

});


client.login(TOKEN);
