import { Client, Interaction ,REST, Routes } from 'discord.js';

import { register } from './commands/register';

export const commands = [
    {
        name: 'register',
        description: 'Register here',
    }
];

export const registerCommands = async (clientId: string, token: string) => {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
};

export const handleCommands = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        switch (interaction.commandName) {

            // register command
            case 'register':
                register(interaction, client);
                break;
                
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};

