import { deleteProfileCommand, deleteProfileConfirm } from '../commands/delete';
import * as dbConnectionModule from '../database/dbConnection';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { ChatInputCommandInteraction, ButtonInteraction } from 'discord.js';

let mongod: MongoMemoryServer;
let client: MongoClient;
let db: Db;

jest.mock('../bot', () => ({
    config: {
        TOKEN: 'mockToken',
        CLIENT_ID: 'mockClientId',
        BOT_ADMIN_ID: 'mockAdminId',
        MONGO_URI: 'mockMongoUri',
        DATABASE_NAME: 'mockDatabase',
    },
}));

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to the in-memory database
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_database');

    // Mock the connectToDatabase function
    jest.spyOn(dbConnectionModule, 'connectToDatabase').mockResolvedValue(db);
});

afterAll(async () => {
    // Clean up the database and stop the in-memory server
    await db.collection('users').deleteMany({});
    await client.close();
    await mongod.stop();
});

describe('Integration Tests for Delete Command', () => {
    const mockCommandInteraction = {
        reply: jest.fn(),
        options: {
            getString: jest.fn(),
        },
        user: { id: '12345' },
    } as unknown as ChatInputCommandInteraction;

    const mockButtonInteraction = {
        deferReply: jest.fn(),
        editReply: jest.fn(),
        customId: 'delete_profile_confirm:testProfile',
        user: { id: '12345' },
    } as unknown as ButtonInteraction;

    beforeEach(async () => {
        jest.clearAllMocks();
        await db.collection('users').deleteMany({});
        await db.collection('users').insertOne({
            username: 'testUser',
            discord_id: '12345',
            profiles: [{ nickname: 'testProfile' }],
        });
    });

    it('should reply with an error if the profile does not exist', async () => {
        (mockCommandInteraction.options.getString as jest.Mock).mockReturnValue('nonexistentProfile');

        await deleteProfileCommand(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith({
            content: 'You do not have a profile named `nonexistentProfile`.',
            flags: expect.anything(),
        });
    });

    it('should prompt confirmation if the profile exists', async () => {
        (mockCommandInteraction.options.getString as jest.Mock).mockReturnValue('testProfile');

        await deleteProfileCommand(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith(
            expect.objectContaining({
                embeds: expect.any(Array),
                components: expect.any(Array),
            })
        );
    });

    it('should delete the profile and update the database on confirmation', async () => {
        await deleteProfileConfirm(mockButtonInteraction);

        const updatedUser = await db.collection('users').findOne({ discord_id: '12345' });

        expect(updatedUser).not.toBeNull();
        expect(updatedUser?.profiles).toEqual([]);
        expect(mockButtonInteraction.editReply).toHaveBeenCalledWith({
            content: 'Profile testProfile has been deleted.',
        });
    });
});
