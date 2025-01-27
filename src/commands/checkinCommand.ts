import {CommandInteraction, MessageFlags} from "discord.js";
import { findUserByDiscordId } from "../database/userRepository";
import { genshinCheckin } from "../games/genshin/checkin_genshin";
import {hkstrCheckin} from "../games/hk_starrail/checkin_hkstr";
import {zzzCheckin} from "../games/zenless_zone_zero/checkin_zenless";
import {Profile, User} from "../types";
import logger from "../utils/logger";
import {incrementExpiredCookies, trackError} from "../utils/metrics";

export async function checkinCommand(interaction: CommandInteraction) {

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    try {

        const user: User | null = await findUserByDiscordId(interaction.user.id);
        if (!user) {
            await interaction.editReply({
                content: 'User not found. Please register first using /register',
            });
            return;
        }

        const profiles: Profile[] = user.profiles;

        let response: string = "";
        for (const profile of profiles) {
            response += `**Checking in for ${profile.nickname}...**\n`;

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
            response += '--------------\n';
        }
        response += 'Check-in completed.';

        if(response.includes('Cookie expired')){
            await incrementExpiredCookies();
        }

        await interaction.editReply({
            content: response
        });

    } catch (error) {
        logger.error('Error during check-in process:', error);
        await trackError('checkinCommand');
        if (!interaction.replied && !interaction.deferred) {
            await interaction.editReply({
                content: 'An error occurred during the check-in process. Please try again later.'
            });
        } else {
            await interaction.editReply({
                content: 'An error occurred during the check-in process. Please try again later.'
            });
        }
    }
}