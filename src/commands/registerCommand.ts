import { CommandInteraction } from 'discord.js';
import { User, addNewUserToFile } from '../bot';
import { getUserGenshinInfo } from '../genshin/getUserInfo_genshin';
import { getUserStarrailInfo } from '../hk_starrail/getUserInfo_hkstr';

export async function register(interaction: CommandInteraction){
    try {

        await interaction.reply("Please check your DM's for further instruction.");

        // Create dmChannel and send instructions
        const dmChannel = await interaction.user.createDM();

        await dmChannel.send('Please follow these instructions carefully.\nhttps://github.com/NickAwrist/Hoyolab_Bot/wiki/How-to-Copy-your-Hoyolab-Cookie\n\n');

        
        // Ask for cookie and start collector
        await dmChannel.send('---------------\n**Please paste your Hoyolab Cookie**\n');
        const cookieCollector = dmChannel.createMessageCollector({ max: 1, time: 300000 });

        // Collect the cookie value
        cookieCollector.on('collect', async (message) => {
            const cookie = message.content.trim();

            if(cookie.includes('Cookie:')){
                cookie.replace('Cookie:', '');
            }

            if (cookie) {

                // Translate the cookies into JSON
                const cookiePairs = cookie.split(';').map(pair => pair.trim().split('='));

                const cookieJSON: Record<string, string> = {};
                cookiePairs.forEach(([key, value]) => {
                    cookieJSON[key] = value;
                });

                console.log('--Fetching Genshin Impact Data');
                const genshinUIDs = await getUserGenshinInfo(cookie, dmChannel);

                console.log('--Fetching Honkai Starrail Data')
                const hkstrUIDs = await getUserStarrailInfo(cookie, dmChannel);

                const newUser: User = {
                    'username': interaction.user.username,
                    'discord_id': interaction.user.id,
                    'genshin': genshinUIDs,
                    'hk_str': hkstrUIDs,
                    'hk_imp': [],
                    'pasted_cookie': cookieJSON,
                    'raw_cookie': cookie
                };     

                if(newUser.genshin.length == 0 && newUser.hk_str.length == 0 && newUser.hk_imp.length == 0){
                    dmChannel.send('No accounts were found with the provided cookies. Please try again.');
                }else{
                    dmChannel.send('Registration complete! The following accounts have been saved to your profile.');
                    addNewUserToFile('userData.json', newUser);
                }

               
            } else {
                dmChannel.send('Invalid input. Please provide a valid cookie. Do /register again.');
            }
        });

        cookieCollector.on('end', (collected, reason) => {
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