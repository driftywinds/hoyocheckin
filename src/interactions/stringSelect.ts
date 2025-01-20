import {
    Interaction,
} from "discord.js";
import {handleDeleteProfile} from "../commands/delete";



export async function handleStringSelectInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'delete_profile_selector') {
        await handleDeleteProfile(interaction);
    }
}