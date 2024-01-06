import { Client, Interaction ,REST, Routes, ApplicationCommandType, SlashCommandBuilder, ApplicationCommandOptionType } from 'discord.js';

import dotenv from 'dotenv';

import { register } from './commands/registerCommand';
import { redeemForAllUsers, redeemCode } from './commands/redeemCommands';
import { updateAccount } from './commands/updateAccountCommand';

import { readUsersFromFile, getUserById, User } from './bot';

dotenv.config();

export const commands = [
    {
        name: 'register',
        description: 'Register here',
        type: ApplicationCommandType.ChatInput,
    },
    {
        name: 'redeem_allusers',
        description: 'Redeem a code for all users for chosen game',
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'game',
                type: ApplicationCommandOptionType.String,
                description: 'Select the game',
                required: true,
                choices: [
                    { name: 'Genshin Impact', value: 'genshin' },
                    { name: 'Honkai Impact', value: 'honkai' },
                    { name: 'Honkai Starrail', value: 'starrail' },
                ],
            },
            {
                name: 'code',
                type: ApplicationCommandOptionType.String,
                description: 'The redeem code',
                required: true,
            },
        ],
    },
    {
        name: 'redeem',
        description: 'Redeem a code for chosen game',
        type: ApplicationCommandType.ChatInput,
        options: [
            {
                name: 'game',
                type: ApplicationCommandOptionType.String,
                description: 'Select the game',
                required: true,
                choices: [
                    { name: 'Genshin Impact', value: 'genshin' },
                    { name: 'Honkai Impact', value: 'honkai' },
                    { name: 'Honkai Starrail', value: 'starrail' },
                ],
            },
            {
                name: 'code',
                type: ApplicationCommandOptionType.String,
                description: 'The redeem code',
                required: true,
            },
        ],
    },
];

export const registerCommands = async (clientId: string, token: string) => {

    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

    console.log('commands');
};

export const handleCommands = (client: Client) => {
    client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isChatInputCommand()) return;

        switch (interaction.commandName) {

            // register command
            case 'register':
                register(interaction, client);
                
                
                break;
            
            // redeem for all users command
            case 'redeem_allusers':

                // Check if user is bot admin
                if(interaction.user.id !== process.env.BOT_ADMIN_ID){
                    interaction.reply('You do not have permission to use this command.');
                    break;
                }

                // Collect paramaters
                const game_all = interaction.options.getString('game', true);
                const code_all = interaction.options.getString('code', true);
               
                //Run redeemForAllUsers command
                try {
                    await redeemForAllUsers(game_all, code_all);
                    interaction.reply('Redemption successful for all users.');
                } catch (error) {
                    console.error(error);
                    interaction.reply('An error occurred during redemption.');
                }

                break;
            
            // redeem code for user command
            case 'redeem':

                // Collect paramaters
                const game_user = interaction.options.getString('game', true);
                const code_user = interaction.options.getString('code', true);
               
                try {

                    // Get User object from userData
                    const users: User[] = readUsersFromFile('./userData.json');
                    const user: User | undefined = getUserById(users, interaction.user.id);

                    // Run redeemCode command 
                    if(user){
                        const response = await redeemCode(game_user, code_user, user);
                        interaction.reply(response);
                    }else{
                        interaction.reply('Could not find profile with your Discord ID.');
                    }
                    
                } catch (error) {
                    console.error(error);
                    interaction.reply('An error occurred during redemption.');
                }

                break;

            case 'update_account':
                // Get User object from userData
                const users: User[] = readUsersFromFile('./userData.json');
                const userToUpdate: User | undefined = getUserById(users, interaction.user.id);

                if(userToUpdate){
                    updateAccount(userToUpdate, interaction, client);
                }else{
                    interaction.reply('Could not find profile with your Discord ID.');
                }

            
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};



