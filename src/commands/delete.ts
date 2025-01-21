import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    StringSelectMenuBuilder, StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    MessageFlags
} from 'discord.js';
import {deleteProfile, findUserByDiscordId} from "../database/userRepository";
import {User} from "../types";

// Function to handle the delete profile command
export async function deleteProfileCommand(interaction: CommandInteraction): Promise<void> {

    // Find the user in the database
    const user: User | null = await findUserByDiscordId(interaction.user.id);

    // Check if the user has any profiles to delete
    if(!user || user.profiles.length === 0){
        await interaction.reply({
            content: 'You do not have any profiles to delete. Please create a profile first with the /register command.',
        });
        return;
    }

    // Create the embed
    const embed = new EmbedBuilder()
        .setTitle('Delete Profile')
        .setColor(0xae1d00);

    // Collect profile options
    const profileOptions: StringSelectMenuOptionBuilder[] = [];

    user.profiles.forEach(profile => {
        profileOptions.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(profile.nickname)
                .setValue(profile.nickname)
        );
    });

    // Create the profile selector
    const profileSelector = new StringSelectMenuBuilder()
        .setCustomId('delete_profile_selector')
        .setPlaceholder('Select which profile to delete')
        .addOptions(profileOptions);

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(profileSelector);

    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        flags: MessageFlags.Ephemeral
    });
}

// Function to handle the delete profile selector
export async function handleDeleteProfile(interaction: StringSelectMenuInteraction): Promise<void> {

    const nickname: string = interaction.values[0];

    // Confirm button
    const confirmButtonId = `delete_profile_confirm:${nickname}`;
    const confirmButton = new ButtonBuilder()
        .setCustomId(confirmButtonId)
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Danger);

    const confirmationButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton);

    await interaction.reply({
        content: `Are you sure you want to delete profile ${nickname}?`,
        components: [confirmationButtons],
        flags: MessageFlags.Ephemeral
    });
}

export async function deleteProfileConfirm(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferReply({
        flags: MessageFlags.Ephemeral
    });

    const nickname: string = interaction.customId.split(':')[1];

    // Delete the profile from the database
    await deleteProfile(interaction.user.id, nickname);

    await interaction.editReply({
        content: `Profile ${nickname} has been deleted.`
    });
}