import { handleRegistrationSubmit } from '../commands/registration';
import * as dbConnectionModule from '../database/dbConnection';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';
import { ModalSubmitInteraction } from 'discord.js';
import {fetchGameData} from "../hoyolab/profileUtils";

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
}));

beforeAll(async () => {
    // Start the in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to the in-memory database
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test_database');

    // Mock database connection
    jest.spyOn(dbConnectionModule, 'connectToDatabase').mockResolvedValue(db);
});

afterAll(async () => {
    // Close the client and stop the in-memory server
    await client.close();
    await mongod.stop();
});

describe('Integration Tests for Registration Command', () => {
    const mockModalInteraction = {
        reply: jest.fn(),
        deferReply: jest.fn(),
        editReply: jest.fn(),
        customId: 'registration_modal:test-id',
        fields: {
            getTextInputValue: jest.fn(),
        },
        user: { id: '12345', username: 'testUser' },
    } as unknown as ModalSubmitInteraction;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should handle full registration flow and save user in database', async () => {
        (mockModalInteraction.fields.getTextInputValue as jest.Mock).mockImplementation((field) => {
            if (field === 'nickname') return 'integrationTestUser';
            if (field === 'cookies') return 'integrationTestCookies';
        });
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [{}],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: 'Mocked response message',
        });

        await handleRegistrationSubmit(mockModalInteraction);

        const savedUser = await db.collection('users').findOne({ discord_id: '12345' });

        expect(savedUser).not.toBeNull();

        if (!savedUser) {
            throw new Error('User not found in database.');
        }

        expect(savedUser.profiles).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    nickname: 'integrationTestUser',
                }),
            ])
        );
    });
});
