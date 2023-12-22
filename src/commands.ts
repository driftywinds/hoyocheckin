import { REST, Routes } from 'discord.js';
import { describe } from 'node:test';

export const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
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