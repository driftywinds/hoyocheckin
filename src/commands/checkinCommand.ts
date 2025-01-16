import { CommandInteraction } from "discord.js";
import { getUserByDiscordID } from "../bot";
import { genshinCheckin } from "../games/genshin/checkin_genshin";
import {hkstrCheckin} from "../games/hk_starrail/checkin_hkstr";
import {zzzCheckin} from "../games/zenless_zone_zero/checkin_zenless";
import {Profile, User} from "../types";

export async function checkinCommand(interaction: CommandInteraction) {
    try {
        await interaction.reply({ content: 'Processing your check-in request...', ephemeral: true });

        const user: User | undefined = getUserByDiscordID(interaction.user.id);
        if (!user) {
            await interaction.followUp({ content: 'User not found. Please register first using /register', ephemeral: true });
            return;
        }

        const profiles: Profile[] = user.profiles;

        let response: string = "";
        for (const profile of profiles) {
            response += `Checking in for ${profile.nickname}...\n`;

            if (profile.genshin.length > 0) {
                response += `Checking in for Genshin Impact...\n`;
                response += await genshinCheckin(profile) + `\n`;
            }
            if (profile.hk_str.length > 0) {
                response += `Checking in for Honkai Starrail...\n`;
                response += await hkstrCheckin(profile) + `\n`;
            }
            if (profile.zzz.length > 0) {
                response += `Checking in for Zenless Zone Zero...\n`;
                response += await zzzCheckin(profile) + `\n`;
            }
        }
        response += 'Check-in completed.';

        await interaction.followUp({ content: response, ephemeral: true });

    } catch (error) {
        console.error('Error during check-in process:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'An error occurred during the check-in process. Please try again later.', ephemeral: true });
        } else {
            await interaction.followUp({ content: 'An error occurred during the check-in process. Please try again later.', ephemeral: true });
        }
    }
}