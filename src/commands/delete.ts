import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction,
    EmbedBuilder,
    MessageFlags
} from 'discord.js';
import {deleteProfile, findUserByDiscordId} from "../database/userRepository";
import {User} from "../types";
import {decrementTotalProfiles} from "../utils/metrics";

// Function to handle the delete profile command
export async function deleteProfileCommand(interaction: ChatInputCommandInteraction): Promise<void> {


    const profileName: string = interaction.options.getString('profile', true);

    // Find the user in the database
    const user: User | null = await findUserByDiscordId(interaction.user.id);

    // Check if the user has the specified profile to delete
    if (!user || !user.profiles.some(profile => profile.nickname === profileName)) {
        await interaction.reply({
            content: `You do not have a profile named \`${profileName}\`.`,
            flags: MessageFlags.Ephemeral
        });
        return;
    }

    // Create the embed
    const embed = new EmbedBuilder()
        .setTitle(`Are you sure you want to delete the profile, \`${profileName}?\``)
        .setColor(0xae1d00);

    const confirmButtonId: string = `delete_profile_confirm:${profileName}`;
    const confirmButton = new ButtonBuilder()
        .setCustomId(confirmButtonId)
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        flags: MessageFlags.Ephemeral
    });
}

export async function deleteProfileConfirm(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    });

    const nickname: string = interaction.customId.split(':')[1];

    const user: User | null = await findUserByDiscordId(interaction.user.id);

    if(!user || !user.profiles.some(profile => profile.nickname === nickname)){
        await interaction.editReply({
            content: `You do not have a profile named \`${nickname}\`.`
        });
        return;
    }

    // Delete the profile from the database
    await deleteProfile(interaction.user.id, nickname);

    await decrementTotalProfiles();

    await interaction.editReply({
        content: `Profile ${nickname} has been deleted.`
    });
}