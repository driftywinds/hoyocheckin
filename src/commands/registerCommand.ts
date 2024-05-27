import { CommandInteraction, DMChannel } from 'discord.js';
import { User, addNewUserToFile } from '../bot';
import { getUserGenshinInfo } from '../genshin/getUserInfo_genshin';
import { getUserStarrailInfo } from '../hk_starrail/getUserInfo_hkstr';

async function collectNickname(dmChannel: DMChannel): Promise<string | null> {
    await dmChannel.send('---------------\n**Please enter your desired nickname**\n');
    return new Promise((resolve) => {
        const nicknameCollector = dmChannel.createMessageCollector({ max: 1, time: 300000 });

        nicknameCollector.on('collect', (message) => {
            const nickname = message.content.trim();
            if (nickname) {
                resolve(nickname);
            } else {
                dmChannel.send('Invalid input. Please provide a valid nickname.');
                resolve(null);
            }
        });

        nicknameCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
                dmChannel.send('Nickname collection timed out. Please try again.');
                resolve(null);
            }
        });
    });
}

async function collectCookie(dmChannel: DMChannel): Promise<string | null> {
    await dmChannel.send('---------------\n**Please paste your Hoyolab Cookie**\n');
    return new Promise((resolve) => {
        const cookieCollector = dmChannel.createMessageCollector({ max: 1, time: 300000 });

        cookieCollector.on('collect', (message) => {
            let cookie = message.content.trim();
            if (cookie.includes('Cookie:')) {
                cookie = cookie.replace('Cookie:', '').trim();
            }

            if (cookie) {
                resolve(cookie);
            } else {
                dmChannel.send('Invalid input. Please provide a valid cookie.');
                resolve(null);
            }
        });

        cookieCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
                dmChannel.send('Cookie collection timed out. Please try again.');
                resolve(null);
            }
        });
    });
}


export async function register(interaction: CommandInteraction){
    try {
        await interaction.reply("Please check your DM's for further instruction.");

        // Create dmChannel and send instructions
        const dmChannel: DMChannel = await interaction.user.createDM();

        await dmChannel.send('Please follow these instructions carefully.\nhttps://github.com/NickAwrist/Hoyolab_Bot/wiki/How-to-Copy-your-Hoyolab-Cookie\n\n');

        // Start the data collection

        // Collect nickname
        const nickname: string | null = await collectNickname(dmChannel);
        if(!nickname) return;

        // Collect cookie
        const cookie: string | null = await collectCookie(dmChannel);
        if(!cookie) return;

        // Translate the cookies into JSON
        const cookierPairs = cookie?.split(';').map(pair => pair.trim().split('='));
        const cookieJSON: Record<string, string> = {};
        cookierPairs?.forEach(([key, value]) => {
            cookieJSON[key] = value;
        });

        // Fetch their Genshin Impact data
        console.log('--Fetching Genshin Impact Data');
        const genshinUIDs = await getUserGenshinInfo(cookie, dmChannel);

        // Fetch their Honkai Starrail data
        console.log('--Fetching Honkai Starrail Data')
        const hkstrUIDs = await getUserStarrailInfo(cookie, dmChannel);
        
        // Create the new User
        const newUser: User = {
            'nickname': nickname,
            'username': interaction.user.username,
            'discord_id': interaction.user.id,
            'genshin': genshinUIDs,
            'hk_str': hkstrUIDs,
            'hk_imp': [],
            'pasted_cookie': cookieJSON,
            'raw_cookie': cookie
        };

        if (newUser.genshin.length == 0 && newUser.hk_str.length == 0 && newUser.hk_imp.length == 0) {
            dmChannel.send('No accounts were found with the provided cookies. Please try again.');
        } else {
            dmChannel.send('Registration complete! The following accounts have been saved to your profile.');
            addNewUserToFile('userData.json', newUser);
        }

    } catch (error) {
        console.error('Error sending DM:', error);
        interaction.reply('An error occurred while sending a direct message. Please make sure your DMs are open.');
    }
}
