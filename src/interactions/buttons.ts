import {
    Interaction,
} from "discord.js";
import {openRegistrationModal} from "../commands/registration";
import {deleteProfileConfirm} from "../commands/delete";


export async function handleButtonInteraction(interaction: Interaction): Promise<void> {
    if (!interaction.isButton()) return;

    if(interaction.customId.startsWith('delete_profile_confirm:')) {
        await deleteProfileConfirm(interaction);
        return;
    }

    switch (interaction.customId) {

        case 'open_registration_modal': {
            await openRegistrationModal(interaction);
            break;
        }
    }

}