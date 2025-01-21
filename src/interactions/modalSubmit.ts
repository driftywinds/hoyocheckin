import {Interaction} from "discord.js";
import {handleRegistrationSubmit} from "../commands/registration";

export async function handleModalSubmit(interaction: Interaction): Promise<void> {
    if (!interaction.isModalSubmit()) return;

    // Check for dynamic modal IDs
    if (interaction.customId.startsWith('registration_modal:')) {
        await handleRegistrationSubmit(interaction);
    }

}