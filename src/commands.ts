import { Client, Interaction ,REST, Routes } from 'discord.js';
import * as fs from 'fs';

import { User } from './bot';

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

            // register command
            case 'register':
                try {

                    await interaction.reply("Please check your DM's for further instruction.");

                    // Create dmChannel and send instructions
                    const dmChannel = await interaction.user.createDM();

                    await dmChannel.send('Please follow these instructions carefully.' +
                        '\n1) Log onto https://www.hoyolab.com' +
                        "\n2) Go into inspect element mode https://blog.hubspot.com/website/how-to-inspect#:~:text=let's%20learn%20how.-,How%20to%20Inspect%20Elements,PC%20to%20do%20the%20same." +
                        "\n3) In inspect element, click the header that says 'Application' (you may need to make the inspect element portion larger to see it)" +
                        "\n4) Find where it says 'Cookies' and click on the www.hoyolab.com cookie." +
                        "\n5) There you will find where it says 'ltoken_v2' and 'ltuid_v2'. Copy those values");

                    
                    // Ask for ltoken_v2 and start collector
                    await dmChannel.send('\nPlease enter your ltoken_v2 value');
                    const ltokenCollector = dmChannel.createMessageCollector({ max: 1, time: 60000 });

                    // Collect the ltoken_v2 value
                    ltokenCollector.on('collect', async (message) => {
                        const ltoken_v2 = message.content.trim();

                        if (ltoken_v2) {

                            // Ask for ltuid_v2 and start collector
                            await dmChannel.send('\nPlease enter your ltuid_v2 value');
                            const ltuidCollector = dmChannel.createMessageCollector({ max: 1, time: 60000 });

                            // Collect ltuid_v2 value
                            ltuidCollector.on('collect', async (ltuidMessage) => {
                                const ltuid_v2 = ltuidMessage.content.trim();
                            


                                if (ltuid_v2) {

                                    try {

                                        // Gather all user's information from JSON
                                        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
                                        const jsonData = JSON.parse(fileContent);
                                        const existingUserData: User[] = jsonData.users;  

                                        const newUser: User = {
                                            username: interaction.user.username,
                                            user_id: interaction.user.id,
                                            genshin: false,
                                            h_star_rail: false,
                                            h_impact: false,
                                            ltoken_v2: ltoken_v2,
                                            ltuid_v2: ltuid_v2,
                                        };
                                    
                                        const updatedUserData: User[] = [...existingUserData, newUser];
                                        const updatedJsonData = { ...jsonData, users: updatedUserData };

                                        fs.writeFileSync('userData.json', JSON.stringify(updatedJsonData));

                                        // Send completion message
                                        await dmChannel.send('Registration completed. Your cookies have been saved.');

                                    } catch (error) {
                                        console.error('Error reading or parsing userData.json:', error);
                                    }

                                } else {
                                    dmChannel.send('Invalid input. Please provide a valid ltuid_v2. Do /register again.');
                                }
                            });

                            ltuidCollector.on('end', (collected, reason) => {
                                if (reason === 'time') {
                                    dmChannel.send('Registration canceled. No response received within the time limit.');
                                    return;
                                }   
                            });
                        } else {
                            dmChannel.send('Invalid input. Please provide a valid ltoken_v2. Do /register again.');
                        }
                    });

                    ltokenCollector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            dmChannel.send('Registration canceled. No response received within the time limit. (60s)');
                            return;
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

