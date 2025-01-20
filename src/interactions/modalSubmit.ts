import {Interaction} from "discord.js";
import {handleRegistrationSubmit} from "../commands/registration";

export async function handleModalSubmit(interaction: Interaction): Promise<void> {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'registration_modal') {
        await handleRegistrationSubmit(interaction);
    }

}