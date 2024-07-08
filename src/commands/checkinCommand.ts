import {CommandInteraction} from "discord.js";
import {getUserByDiscordID, User, Profile} from "../bot";
import {genshinCheckin} from "../genshin/checkin_genshin";

export async function checkinCommand(interaction: CommandInteraction){

    const user: User | undefined = getUserByDiscordID(interaction.user.id);
    if(!user){
        await interaction.reply('User not found. Please register first using /register');
        return;
    }

    const profiles: Profile[] = user.profiles;

    const response: string = "";
    for(const profile of profiles){
        response.concat(`Checking in for ${profile.nickname}...\n`);

        if(profile.genshin.length > 0) {
            response.concat(`Checking in for Genshin Impact...\n`);
            response.concat(await genshinCheckin(profile)+`\n`);
        }
        if(profile.hk_str.length > 0) {
            response.concat(`Checking in for Honkai Starrail...\n`);
            response.concat(await genshinCheckin(profile)+`\n`);
        }
        if(profile.zzz.length > 0) {
            response.concat(`Checking in for Zenless Zone Zero...\n`);
            response.concat(await genshinCheckin(profile)+`\n`);
        }
    }
    response.concat('Check-in completed.')
    await interaction.reply(response);

}