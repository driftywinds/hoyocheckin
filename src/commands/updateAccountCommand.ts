import { CommandInteraction, Client } from 'discord.js';
import { User, removeUser } from '../bot';

import { register } from './registerCommand';

export async function updateAccount(user: User, interaction: CommandInteraction, client: Client){
    
    removeUser('./userData.json', user);

    register(interaction, client);

}  