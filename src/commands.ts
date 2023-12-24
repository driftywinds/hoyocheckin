import { Client, Interaction ,REST, Routes } from 'discord.js';

import { genshin_checkin } from './genshin/dailycheckin';

export const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
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
            case 'register':
                try {

                    //TODO Make option to add their own cookie or input login info to automatically get cookie

                    await interaction.reply('Check your messages.');

                    const dmChannel = await interaction.user.createDM();
                    await dmChannel.send('Please enter your Hoyo Lab cookie');

                    const collector = dmChannel.createMessageCollector({ max: 1, time: 60000 });

                    collector.on('collect', async (message) => {
                        const cookie = message.content.trim();

                        console.log(message.content);

                        if (cookie) {

                            //TODO Link hoyolab, hash password, add to database

                            const checkin = await genshin_checkin(cookie);

                            if(checkin){
                                //await dmChannel.send(`Successfully checked in!\n${checkin.reward}`);
                                await dmChannel.send('Success!');
                            }else{
                                await dmChannel.send('Unable to check in');
                            }
                            

                        } else {
                            dmChannel.send('Invalid input. Please provide both login and password separated by a space. Do /register again.');
                        }

                        collector.stop();
                    });

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            dmChannel.send('Registration canceled. No response received within the time limit.');
                        }
                    });
                } catch (error) {
                    console.error('Error sending DM:', error);
                    interaction.reply('An error occurred while sending a direct message. Please make sure your DMs are open.');
                }
                break;
                
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};

