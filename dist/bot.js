"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create client object and list intents
const client = new discord_js_1.Client({ intents: [
        discord_js_1.GatewayIntentBits.Guilds,
    ] });
// Process environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
if (!TOKEN || !CLIENT_ID) {
    console.error('Error loading environment variables');
    process.exit(1);
}
// Handle commands
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
];
const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
try {
    console.log('Started refreshing application (/) commands.');
    rest.put(discord_js_1.Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
}
catch (error) {
    console.error(error);
}
client.on('ready', () => {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
});
// Create commands
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'ping') {
        yield interaction.reply('Pong!');
    }
}));
client.login(TOKEN);
