import {
    ActionRow,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    Interaction,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import {deleteProfile, findUserByDiscordId} from "../database/userRepository";
import {User} from "../types";

export async function deleteProfileCommand(interaction: CommandInteraction): Promise<void> {

    const user: User | null = await findUserByDiscordId(interaction.user.id);

    if(!user || user.profiles.length === 0){
        await interaction.reply({
            content: 'You do not have any profiles to delete.'
        });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('Delete Profile')
        .setColor(0xae1d00);

    const profileOptions: StringSelectMenuOptionBuilder[] = [];

    user.profiles.forEach(profile => {
        profileOptions.push(
            new StringSelectMenuOptionBuilder()
                .setLabel(profile.nickname)
                .setValue(profile.nickname)
        );
    });

    const profileSelector = new StringSelectMenuBuilder()
        .setCustomId('delete_profile_selector')
        .setPlaceholder('Select which profile to delete')
        .addOptions(profileOptions);

    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(profileSelector);

    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        options: { ephemeral: true }
    });
}

export async function handleDeleteProfile(interaction: Interaction): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;

    await interaction.message.delete();

    const nickname: string = interaction.values[0];

    // Confirm button
    const confirmButton = new ButtonBuilder()
        .setCustomId('delete_profile_confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Danger);

    // Cancel button
    const cancelButton = new ButtonBuilder()
        .setCustomId('delete_profile_cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const confirmationButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(confirmButton, cancelButton);

    await interaction.reply({
        content: `Are you sure you want to delete profile ${nickname}?`,
        components: [confirmationButtons],
        options: { ephemeral: true }
    });
}

export async function deleteProfileConfirm(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    await interaction.deferReply({ ephemeral: true });

    // Delete the original message
    await interaction.message.delete();

    const nickname: string = interaction.message.content.split(' ')[8].slice(0, -1);

    await deleteProfile(interaction.user.id, nickname);

    await interaction.editReply({
        content: `Profile ${nickname} has been deleted.`,
        options: { ephemeral: true }
    });
}

export async function deleteProfileCancel(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    // Delete the original message
    await interaction.message.delete();

    // Send the follow-up message
    await interaction.reply({
        content: 'Profile deletion cancelled.',
    });
}