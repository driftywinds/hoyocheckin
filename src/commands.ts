import { Client, Interaction ,REST, Routes, ApplicationCommandType } from 'discord.js';

import dotenv from 'dotenv';

import { register } from './commands/registerCommand';
import {checkinCommand} from "./commands/checkinCommand";

import { checkinAllUsers } from './hoyolab/checkinAllUsers';
import {getTime} from "./bot";

dotenv.config();

export const commands = [
    {
        name: 'register',
        description: 'Register here',
        type: ApplicationCommandType.ChatInput,
        cooldown: 60,
    },
    {
        name: 'checkin_all',
        description: 'Check in all users. BOT DEVELOPER ONLY',
        type: ApplicationCommandType.ChatInput,
    },
    {
        name: 'checkin',
        description: 'Checks you in.',
        type: ApplicationCommandType.ChatInput,
        cooldown: 900,
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

const cooldowns = new Map<string, Map<string, number>>();


export const handleCommands = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const time: string = getTime();
        console.log(`${time}| Received command ${interaction.commandName} from ${interaction.user.tag}`);

        const command = commands.find(cmd => cmd.name === interaction.commandName);
        if (!command) {
            return;
        }

        // Check for command cooldowns
        if (command.cooldown) {
            if (!cooldowns.has(interaction.commandName)) {
                cooldowns.set(interaction.commandName, new Map());
            }

            const now: number = Date.now();
            const timestamps: Map<string, number> = cooldowns.get(interaction.commandName)!;
            const cooldownAmount: number = command.cooldown * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime: number = timestamps.get(interaction.user.id)! + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeft: number = (expirationTime - now) / 1000;
                    await interaction.reply({ content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`, ephemeral: true });
                    return;
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        }

        switch (interaction.commandName) {

            // register command
            case 'register': {
                await register(interaction);
                   
                break;
            }

            case 'checkin_all':{

                // Check if user is bot admin
                if(interaction.user.id !== process.env.BOT_ADMIN_ID){
                    interaction.reply('You do not have permission to use this command. Use /checkin to check yourself in manually.');
                    break;
                }

                await checkinAllUsers();
                //interaction.reply('All users checked in');

                break;
            }

            // checkin command
            case 'checkin': {
                await checkinCommand(interaction);

                break;
            }
            
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};



