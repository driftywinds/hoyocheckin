import { Client, Interaction ,REST, Routes } from 'discord.js';

export const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'register',
        description: 'Register here',
    }
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
            case 'register':
                try {

                    //TODO Make option to add their own cookie or input login info to automatically get cookie

                    await interaction.reply('Check your messages.');

                    const dmChannel = await interaction.user.createDM();
                    await dmChannel.send('Please enter your login and password, separated by a space. For example\nMyUsername MyPassword');

                    const collector = dmChannel.createMessageCollector({ max: 1, time: 60000 });

                    collector.on('collect', (message) => {
                        const userInput = message.content.trim();
                        const [login, password] = userInput.split(' ');

                        console.log(message.content);

                        if (login && password) {

                            //TODO Link hoyolab, hash password, add to database

                            dmChannel.send(`Registration successful! \`Login: ${login}\`, \`Password: ${password}\``);

                        } else {
                            dmChannel.send('Invalid input. Please provide both login and password separated by a space. Do /register again.');
                        }

                        collector.stop();
                    });

                    collector.on('end', (collected, reason) => {
                        if (reason === 'time') {
                            dmChannel.send('Registration canceled. No response received within the time limit.');
                        }
                    });
                } catch (error) {
                    console.error('Error sending DM:', error);
                    interaction.reply('An error occurred while sending a direct message. Please make sure your DMs are open.');
                }
                break;
                
            default:
                console.error(`Unknown command ${interaction.commandName}`);
        }
    });
};

