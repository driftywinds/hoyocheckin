import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { saveUser } from '../database/userRepository';
import { fetchGameData, getUserProfile, parseCookies } from '../hoyolab/profileUtils';
import logger from "../logger";

export async function updateProfileCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
        const profileName = interaction.options.getString('profile', true);
        const newCookies = interaction.options.getString('cookies', true);

        // Retrieve user and their profile
        const userProfile = await getUserProfile(interaction.user.id, profileName);
        if (!userProfile) {
            await interaction.editReply({ content: `No profile found with the nickname \`${profileName}\`.` });
            return;
        }

        const { user, profileIndex } = userProfile;

        // Parse cookies and fetch game data
        const parsedCookies = parseCookies(newCookies);
        const { genshinUIDs, hkstrUIDs, zenlessUIDs, responseMessage } = await fetchGameData(newCookies);

        if (genshinUIDs.length === 0 && hkstrUIDs.length === 0 && zenlessUIDs.length === 0) {
            await interaction.editReply({
                content: 'No data was found for the provided cookies. Please ensure they are correct.',
            });
            return;
        }

        // Update the profile
        user.profiles[profileIndex] = {
            ...user.profiles[profileIndex],
            raw_cookie: newCookies,
            pasted_cookie: parsedCookies,
            genshin: genshinUIDs,
            hk_str: hkstrUIDs,
            zzz: zenlessUIDs,
        };

        await saveUser(user);
        await interaction.editReply({ content: `Profile \`${profileName}\` updated successfully.\n\n${responseMessage}` });
    } catch (error) {
        logger.error('Error updating profile:', error);
        await interaction.editReply({ content: 'An error occurred while updating the profile. Please try again later.' });
    }
}
