import {Interaction, REST, Routes, ApplicationCommandType, ChatInputCommandInteraction, MessageFlags} from 'discord.js';

import {registerCommand} from '../commands/registration';
import {checkinCommand} from "../commands/checkinCommand";

import { checkinAllUsers } from '../hoyolab/checkinAllUsers';

import {config} from "../bot";
import {deleteProfileCommand} from "../commands/delete";
import {listProfilesCommand} from "../commands/listProfiles";
import {updateProfileCommand} from "../commands/updateProfile";
import logger from "../logger";

const commands = [
    {
        name: 'register',
        description: 'Register here',
        type: ApplicationCommandType.ChatInput,
        cooldown: 60,
    },
    {
        name: 'delete',
        description: 'Delete your a profile',
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'profile',
                description: 'The profile you want to delete',
                type: 3,
                required: true,
            }
        ],
        cooldown: 10,
    },
    {
        name: 'list_profiles',
        description: 'List all your profiles',
        type: ApplicationCommandType.ChatInput,
        cooldown: 10,
    },
    {
        name: 'update_profile',
        description: 'Update your profile with new cookies',
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'profile',
                description: 'The profile you want to update',
                type: 3,
                required: true,
            },
            {
                name: 'cookies',
                description: 'The new cookies you want to set',
                type: 3,
                required: true,
            }
        ],
        cooldown: 30,
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

    const rest: REST = new REST({ version: '10' }).setToken(token);

    await (async () => {
        try {
            await rest.put(
                Routes.applicationCommands(clientId),
                {body: commands},
            );
        } catch (error) {
            logger.error(error);
        }
    })();
};


const cooldowns = new Map<string, Map<string, number>>();

export async function handleCommands(interaction: Interaction) {
    if (!interaction.isCommand()) return;
    logger.info(`Received command ${interaction.commandName} from ${interaction.user.tag}`);

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
                await interaction.reply({
                    content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    switch (interaction.commandName) {

        // register command
        case 'register': {
            await registerCommand(interaction);

            break;
        }

        // delete command
        case 'delete': {
            await deleteProfileCommand(interaction as ChatInputCommandInteraction);

            break;
        }

        // updateProfile command
        case 'update_profile': {
            await updateProfileCommand(interaction as ChatInputCommandInteraction);

            break;
        }

        // listProfiles command
        case 'list_profiles': {
            await listProfilesCommand(interaction);

            break;
        }

        case 'checkin_all':{

            // Check if user is bot admin
            if(interaction.user.id !== config.BOT_ADMIN_ID){
                interaction.reply('You do not have permission to use this command. Use /checkin to check yourself in manually.');
                break;
            }

            await checkinAllUsers();

            break;
        }

        // checkin command
        case 'checkin': {
            await checkinCommand(interaction);

            break;
        }

        default:
            logger.error(`Unknown command ${interaction.commandName}`);
    }
}



