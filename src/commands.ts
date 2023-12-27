import { Client, Interaction ,REST, Routes } from 'discord.js';

import dotenv from 'dotenv';

import { register } from './commands/register';
import { redeemForAllUsers } from './commands/redeemForAllUsers';
import { redeemCode } from './commands/redeemCode';

import { readUsersFromFile, getUserById, User } from './bot';

dotenv.config();

export const commands = [
    {
        name: 'register',
        description: 'Register here',
    },
    {
        name: 'redeem_allusers',
        description: 'Redeem a code for all users for chosen game',
        options: [
            {
                name: 'game',
                type: 3,
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
                type: 3,
                description: 'The redeem code',
                required: true,
            },
        ],
    },
    {
        name: 'redeem',
        description: 'Redeem a code for chosen game',
        options: [
            {
                name: 'game',
                type: 3,
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
                type: 3,
                description: 'The redeem code',
                required: true,
            },
        ],
    },
];

export const registerCommands = async (clientId: string, token: string) => {
    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
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

                if(interaction.user.id !== process.env.BOT_ADMIN_ID){
                    interaction.reply('You do not have permission to use this commadn.');
                    break;
                }

                const game_all = interaction.options.getString('game', true);
                const code_all = interaction.options.getString('code', true);
               
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

                const game_user = interaction.options.getString('game', true);
                const code_user = interaction.options.getString('code', true);
               
                try {

                    const users: User[] = readUsersFromFile('./userData.json');
                    const user: User | undefined = getUserById(users, interaction.user.id);

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


            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};



