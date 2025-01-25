import {
    Interaction,
} from "discord.js";

export async function handleStringSelectInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isStringSelectMenu()) return;

}