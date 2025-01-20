import {
    ActionRowBuilder, ButtonBuilder,
    CommandInteraction, EmbedBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonStyle, Interaction
} from 'discord.js';
import {Profile, UID, User} from "../types";
import {findUserByDiscordId, saveUser} from "../database/userRepository";
import {getUserZenlessInfo} from "../games/zenless_zone_zero/getUserInfo_zenless";
import {getUserStarrailInfo} from "../games/hk_starrail/getUserInfo_hkstr";
import {getUserGenshinInfo} from "../games/genshin/getUserInfo_genshin";

const INSTRUCTIONS_LINK: string = 'https://drive.google.com/file/d/1-xQcXzajgvd2dq3r9ocVW5fUcf6DybG0/view?usp=sharing';

export async function registerCommand(interaction: CommandInteraction): Promise<void> {

    // Create registration instructions embed
    const embed = new EmbedBuilder()
        .setTitle('Registration Instructions')
        .setDescription(`Please follow the instructions in the link below to get your cookies:\n[Click here to view instructions](${INSTRUCTIONS_LINK})`)
        .setColor(0x00ae86);

    const button = new ButtonBuilder()
        .setCustomId('open_registration_modal')
        .setLabel('Open Registration')
        .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

    // Send the embed with the button
    await interaction.reply({
        embeds: [embed],
        components: [actionRow],
        options: { ephemeral: true }
    });
}

export async function openRegistrationModal(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    // Create Modal
    const modal = new ModalBuilder()
        .setCustomId('registration_modal')
        .setTitle('Registration Instructions');

    // Add input component
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

export async function handleRegistrationSubmit(interaction: Interaction): Promise<void> {
    if (!interaction.isModalSubmit()) return;

    await interaction.deferReply({});

    try {
        const discord_id: string = interaction.user.id;

        // Check if the user already has an account
        const existingUser: User | null = await findUserByDiscordId(discord_id);
        const profiles: Profile[] = existingUser?.profiles || [];

        const nickname: string = interaction.fields.getTextInputValue('nickname');
        const cookies: string = interaction.fields.getTextInputValue('cookies');

        // Check for duplicate nickname
        if (profiles.some(profile => profile.nickname === nickname)) {
            await interaction.editReply({
                content: 'A profile with the same nickname already exists. Please choose a different nickname.',
                options: { ephemeral: true }
            });
            return;
        }

        // Translate cookies into JSON
        const cookiePairs = cookies?.split(';').map(pair => pair.trim().split('='));
        const cookieJSON: Record<string, string> = {};
        cookiePairs?.forEach(([key, value]) => {
            cookieJSON[key] = value;
        });

        let finalResponse: string = "";

        // Fetch Genshin Impact data
        console.log('--Fetching Genshin Impact Data');
        const genshinUIDs: UID[] = await getUserGenshinInfo(cookies);

        if (genshinUIDs.length > 0) {
            finalResponse += 'Found the following Genshin Impact data:\n\n';
            genshinUIDs.forEach(uid => {
                finalResponse += `Region: **${uid.region_name}**\n`;
                finalResponse += `Nickname: **${uid.nickname}**\n`;
                finalResponse += `Level: **${uid.level}**\n\n`;
            });
        }

        // Fetch Honkai Starrail data
        console.log('--Fetching Honkai Starrail Data');
        const hkstrUIDs: UID[] = await getUserStarrailInfo(cookies);

        if (hkstrUIDs.length > 0) {
            finalResponse += 'Found the following Honkai Starrail data:\n\n';
            hkstrUIDs.forEach(uid => {
                finalResponse += `Region: **${uid.region_name}**\n`;
                finalResponse += `Nickname: **${uid.nickname}**\n`;
                finalResponse += `Level: **${uid.level}**\n\n`;
            });
        }

        // Fetch Zenless Zone Zero data
        console.log('--Fetching Zenless Zone Zero Data');
        const zenlessUIDs: UID[] = await getUserZenlessInfo(cookies);

        if (zenlessUIDs.length > 0) {
            finalResponse += 'Found the following Zenless Zone Zero data:\n\n';
            zenlessUIDs.forEach(uid => {
                finalResponse += `Region: **${uid.region_name}**\n`;
                finalResponse += `Nickname: **${uid.nickname}**\n`;
                finalResponse += `Level: **${uid.level}**\n\n`;
            });
        }

        if(genshinUIDs.length === 0 && hkstrUIDs.length === 0 && zenlessUIDs.length === 0) {
            await interaction.editReply({
                content: 'No data was found for the cookies provided. Please ensure that the cookies are correct.\nIf you are still facing issues, try logging out and logging back into Hoyolab.',
            });
            return;
        }

        // Create the new profile
        const newProfile: Profile = {
            nickname: nickname,
            genshin: genshinUIDs,
            hk_str: hkstrUIDs,
            zzz: zenlessUIDs,
            pasted_cookie: cookieJSON,
            raw_cookie: cookies,
        };

        if (existingUser) {
            profiles.push(newProfile);
            existingUser.profiles = profiles;
            await saveUser(existingUser);
            finalResponse += 'Successfully added the new profile to your account.';
        } else {
            const newUser: User = {
                username: interaction.user.username,
                discord_id: discord_id,
                profiles: [newProfile],
            };
            await saveUser(newUser);
            finalResponse += 'Successfully registered your account.';
        }

        const checkinTime: number = getNextDailyTimeInUTC();
        finalResponse += `Your profile is enrolled to check-in everyday at <t:${checkinTime}:t>.\n`;
        finalResponse += 'You can also manually check-in using the `/checkin` command.\n';

        // Edit the deferred reply with the final response
        await interaction.editReply({
            content: finalResponse,
        });
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: 'An unexpected error occurred while processing your registration. Please try again later.',
        });
    }
}

// Function to calculate the next 12:07 EST in UTC
function getNextDailyTimeInUTC(): number {
    const now = new Date();

    // Calculate 12:07 PM EST in UTC
    const targetHourEST = 12; // 12 PM EST
    const targetMinute = 7; // 07 minutes
    const estOffset = 5; // EST is UTC-5

    // Create a Date object for today at 12:07 PM EST
    const targetTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), targetHourEST + estOffset, targetMinute, 0));

    // If the target time has already passed today, schedule for tomorrow
    if (targetTime.getTime() < now.getTime()) {
        targetTime.setUTCDate(targetTime.getUTCDate() + 1);
    }

    return Math.floor(targetTime.getTime() / 1000);
}