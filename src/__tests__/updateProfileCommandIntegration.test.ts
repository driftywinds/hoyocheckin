import { updateProfileCommand } from '../commands/updateProfile';
import * as dbConnectionModule from '../database/dbConnection';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { ChatInputCommandInteraction } from 'discord.js';
import {fetchGameData, getUserProfile} from '../hoyolab/profileUtils';

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
jest.mock('../utils/encryption', () => ({
    encrypt: jest.fn((value) => value),
    encryptParsedCookies: jest.fn((cookies) => cookies),
}));

jest.mock('../hoyolab/profileUtils', () => ({
    parseCookies: jest.fn(),
    fetchGameData: jest.fn(),
    getUserProfile: jest.fn(),
}));

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to the in-memory database
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_database');

    // Mock connectToDatabase to return the in-memory database
    jest.spyOn(dbConnectionModule, 'connectToDatabase').mockResolvedValue(db);
});

afterAll(async () => {
    // Clean up the database and stop the in-memory server
    await db.collection('users').deleteMany({});
    await client.close();
    await mongod.stop();
});

describe('Integration Tests for Update Profile Command', () => {
    const mockInteraction = {
        deferReply: jest.fn(),
        editReply: jest.fn(),
        options: {
            getString: jest.fn(),
        },
        user: { id: '12345' },
    } as unknown as ChatInputCommandInteraction;

    beforeEach(async () => {
        jest.clearAllMocks();
        await db.collection('users').deleteMany({});
        await db.collection('users').insertOne({
            username: 'testUser',
            discord_id: '12345',
            profiles: [{ nickname: 'testProfile', genshin: [] }],
        });
    });

    it('should update the profile and save it in the database', async () => {
        (mockInteraction.options.getString as jest.Mock).mockImplementation((option) => {
            if (option === 'profile') return 'testProfile';
            if (option === 'cookies') return 'testCookies';
        });
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [{ uid: 123456 }],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: 'Mocked game data fetch successful!',
        });
        (getUserProfile as jest.Mock).mockResolvedValue({
            user: {
                username: 'testUser',
                discord_id: '12345',
                profiles: [{ nickname: 'testProfile', genshin: [] }],
            },
            profileIndex: 0,
        });

        await updateProfileCommand(mockInteraction);

        // Verify the database was updated
        const updatedUser = await db.collection('users').findOne({ discord_id: '12345' });

        expect(updatedUser).not.toBeNull();

        if (!updatedUser) {
            throw new Error('User not found in database.');
        }

        // Verify the profile was updated
        expect(updatedUser.profiles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    nickname: 'testProfile',
                    genshin: expect.arrayContaining([{ uid: 123456 }]),
                }),
            ])
        );

        // Verify interaction response
        expect(mockInteraction.editReply).toHaveBeenCalledWith({
            content: expect.stringContaining('Profile `testProfile` updated successfully.'),
        });
    });
});
