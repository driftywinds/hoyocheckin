import {CommandInteraction, Embed, EmbedBuilder, MessageFlags} from 'discord.js';
import { findUserByDiscordId } from '../database/userRepository';
import {Profile, UID, User} from '../types';

export async function listProfilesCommand(interaction: CommandInteraction): Promise<void> {
    // Find the user in the database
    const user: User | null = await findUserByDiscordId(interaction.user.id);

    if (!user || user.profiles.length === 0) {
        await interaction.reply({
            content: 'You do not have any profiles.',
            flags: MessageFlags.Ephemeral,
        });
        return;
    }

    // Create the embed
    const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s Profiles`)
        .setColor(0x00AE86);

    user.profiles.forEach((profile: Profile) => {
        const genshinInfo = profile.genshin.map((uid: UID) => `UID: ${uid.gameUid}, Level: ${uid.level}`).join('\n');
        const hkStrInfo = profile.hk_str.map((uid: UID) => `UID: ${uid.gameUid}, Level: ${uid.level}`).join('\n');
        const zzzInfo = profile.zzz.map((uid: UID) => `UID: ${uid.gameUid}, Level: ${uid.level}`).join('\n');

        embed.addFields({
            name: profile.nickname,
            value: `**Genshin Impact:**\n${genshinInfo}\n\n**Honkai Star Rail:**\n${hkStrInfo}\n\n**Zenless Zone Zero:**\n${zzzInfo}\n-----------\n`
        });
    });

    await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
    });
}