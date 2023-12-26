import { CommandInteraction, Client } from 'discord.js';
import { User } from '../bot';
import * as fs from 'fs';

export async function register(interaction: CommandInteraction, client: Client){
    try {

        await interaction.reply("Please check your DM's for further instruction.");

        // Create dmChannel and send instructions
        const dmChannel = await interaction.user.createDM();

        await dmChannel.send('Please follow these instructions carefully.\nhttps://github.com/NickAwrist/Hoyolab_Bot/wiki/How-to-Copy-your-Hoyolab-Cookie\n\n');

        
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
                                genshin: [],
                                h_star_rail: [],
                                h_impact: [],
                                ltoken_v2: ltoken_v2,
                                ltuid_v2: ltuid_v2,
                                pasted_cookie: '',
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
}