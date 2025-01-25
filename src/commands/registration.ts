import {
    ActionRowBuilder,
    ButtonBuilder,
    CommandInteraction,
    EmbedBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle,
    ButtonInteraction,
    ModalSubmitInteraction,
    MessageFlags,
    ColorResolvable,
} from 'discord.js';
import { Profile, User } from '../types';
import { findUserByDiscordId, saveUser } from '../database/userRepository';
import { fetchGameData, parseCookies } from '../hoyolab/profileUtils';

const INSTRUCTIONS_LINK: string = 'https://drive.google.com/file/d/1-xQcXzajgvd2dq3r9ocVW5fUcf6DybG0/view?usp=sharing';

// Register command. Prompts the user with an embed and button to register.
export async function registerCommand(interaction: CommandInteraction): Promise<void> {
    // Create registration instructions embed
    const embed = new EmbedBuilder()
        .setTitle('Registration Instructions')
        .setDescription(
            `Please follow the instructions in the link below to get your cookies:\n[Click here to view instructions](${INSTRUCTIONS_LINK})`
        )
        .setColor(0x00ae86);

    // Button to open the registration modal
    const button = new ButtonBuilder()
        .setCustomId('open_registration_modal')
        .setLabel('Open Registration')
        .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    // Send the embed with the button
    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
    });
}

// Opens the registration modal. After the user clicks the register button, this modal appears.
export async function openRegistrationModal(interaction: ButtonInteraction): Promise<void> {
    const modalId = `registration_modal:${interaction.message.id}`;

    // Create Modal
    const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle('Registration Instructions');

    // Input components
    const nicknameInput = new TextInputBuilder()
        .setCustomId('nickname')
        .setLabel('Nickname')
        .setPlaceholder('Enter your nickname')
        .setRequired(true)
        .setStyle(TextInputStyle.Short);

    const cookiesInput = new TextInputBuilder()
        .setCustomId('cookies')
        .setLabel('Cookies')
        .setPlaceholder('Enter your cookies')
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    const nicknameActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nicknameInput);
    const cookiesActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(cookiesInput);

    modal.addComponents(nicknameActionRow, cookiesActionRow);

    await interaction.showModal(modal);
}

// Handles the registration form submission. This function is called when the user submits the registration form.
export async function handleRegistrationSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({
        flags: MessageFlags.Ephemeral,
    });

    const originalMessageId = interaction.customId.split(':')[1];

    try {
        const discordId: string = interaction.user.id;

        // Check if the user already has an account
        const existingUser: User | null = await findUserByDiscordId(discordId);
        const profiles = existingUser?.profiles || [];

        const nickname: string = interaction.fields.getTextInputValue('nickname');
        const rawCookies: string = interaction.fields.getTextInputValue('cookies');

        // Check for duplicate nickname
        if (profiles.some(profile => profile.nickname === nickname)) {
            await interaction.editReply({
                content: 'A profile with the same nickname already exists. Please choose a different nickname.',
            });
            await updateOriginalEmbed(
                originalMessageId,
                '**Registration failed!**',
                'A profile with the same nickname already exists. Please choose a different nickname.',
                0xff0000,
                interaction
            );
            return;
        }

        // Parse cookies and fetch game data
        const parsedCookies = parseCookies(rawCookies);
        const { genshinUIDs, hkstrUIDs, zenlessUIDs, responseMessage } = await fetchGameData(rawCookies);

        if (genshinUIDs.length === 0 && hkstrUIDs.length === 0 && zenlessUIDs.length === 0) {
            await interaction.editReply({
                content:
                    'No data was found for the cookies provided. Please ensure that the cookies are correct.\nIf you are still facing issues, try logging out and logging back into Hoyolab.',
            });
            await updateOriginalEmbed(
                originalMessageId,
                '**Registration failed!**',
                'No data was found for the cookies provided. Please ensure that the cookies are correct.\nIf you are still facing issues, try logging out and logging back into Hoyolab.',
                0xff0000,
                interaction
            );
            return;
        }

        // Create the new profile
        const newProfile: Profile = {
            nickname,
            genshin: genshinUIDs,
            hk_str: hkstrUIDs,
            zzz: zenlessUIDs,
            pasted_cookie: parsedCookies,
            raw_cookie: rawCookies,
        };

        // Save the user
        if (existingUser) {
            profiles.push(newProfile);
            existingUser.profiles = profiles;
            await saveUser(existingUser);
        } else {
            const newUser: User = {
                username: interaction.user.username,
                discord_id: discordId,
                profiles: [newProfile],
            };
            await saveUser(newUser);
        }

        // Respond with success
        const checkinTime: number = getNextDailyTimeInUTC();
        const successDescription = `Your profile is enrolled to check in every day at <t:${checkinTime}:t>.\nYou can also manually check-in using the \`/checkin\` command.`;

        await interaction.editReply({
            content: `Successfully registered the profile \`${nickname}\`.\n\n${responseMessage}`,
        });

        await updateOriginalEmbed(originalMessageId, '**Registration successful!**', successDescription, 0x00ff00, interaction);
    } catch (error) {
        console.error('Error during registration:', error);
        await interaction.editReply({
            content: 'An unexpected error occurred while processing your registration. Please try again later.',
        });
    }
}

// Function to update the original embed from the registration message
async function updateOriginalEmbed(
    originalMessageId: string,
    title: string,
    description: string,
    color: ColorResolvable,
    interaction: ModalSubmitInteraction
) {
    const originalMessage = await interaction.channel?.messages.fetch(originalMessageId);
    if (originalMessage) {
        const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0])
            .setTitle(title)
            .setDescription(description)
            .setColor(color);

        await originalMessage.edit({
            embeds: [updatedEmbed],
            components: [],
        });
    }
}

// Function to calculate the next 12:07 PM EST in UTC
function getNextDailyTimeInUTC(): number {
    const now = new Date();
    const targetHourEST = 12;
    const targetMinute = 7;
    const estOffset = 5;

    const targetTime = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), targetHourEST + estOffset, targetMinute, 0)
    );

    if (targetTime.getTime() < now.getTime()) {
        targetTime.setUTCDate(targetTime.getUTCDate() + 1);
    }

    return Math.floor(targetTime.getTime() / 1000);
}
