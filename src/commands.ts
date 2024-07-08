import { Client, Interaction ,REST, Routes, ApplicationCommandType } from 'discord.js';

import dotenv from 'dotenv';

import { register } from './commands/registerCommand';

import { checkinAllUsers } from './hoyolab/checkinAllUsers';
import {getTime} from "./bot";

dotenv.config();

export const commands = [
    {
        name: 'register',
        description: 'Register here',
        type: ApplicationCommandType.ChatInput,
    },
    {
        name: 'checkin_all',
        description: 'Check in all users. ADMIN ONLY',
        type: ApplicationCommandType.ChatInput,
    },
    {
        name: 'ping',
        description: 'Replies with Pong!',
        type: ApplicationCommandType.ChatInput,
    }
];

export const registerCommands = async (clientId: string, token: string) => {

    const rest = new REST({ version: '10' }).setToken(token);

    await (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                {body: commands},
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
};

export const handleCommands = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const time: string = getTime();
        console.log(`${time}| Received command ${interaction.commandName} from ${interaction.user.tag}`);

        switch (interaction.commandName) {

            // register command
            case 'register': {
                await register(interaction);
                   
                break;
            }

            case 'checkin_all':{

                // Check if user is bot admin
                if(interaction.user.id !== process.env.BOT_ADMIN_ID){
                    interaction.reply('You do not have permission to use this command.');
                    break;
                }

                await checkinAllUsers();
                //interaction.reply('All users checked in');

                break;
            }
            
            case 'ping':{
                interaction.reply('Pong!');

                break;
            }
            
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};



