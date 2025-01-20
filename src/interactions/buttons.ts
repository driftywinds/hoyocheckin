import {
    Interaction,
} from "discord.js";
import {openRegistrationModal} from "../commands/registration";
import {deleteProfileCancel, deleteProfileConfirm} from "../commands/delete";


export async function handleButtonInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    switch (interaction.customId) {

        case 'open_registration_modal': {
            await openRegistrationModal(interaction);
            break;
        }

        case 'delete_profile_confirm': {
            await deleteProfileConfirm(interaction);
            break;
        }

        case 'delete_profile_cancel': {
            await deleteProfileCancel(interaction);
            break;
        }

    }

}