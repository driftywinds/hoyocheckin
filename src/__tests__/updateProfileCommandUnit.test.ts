jest.mock('../database/userRepository', () => ({
    saveUser: jest.fn(),
}));
jest.mock('../hoyolab/profileUtils', () => ({
    parseCookies: jest.fn(),
    fetchGameData: jest.fn(),
    getUserProfile: jest.fn(),
}));

import { updateProfileCommand } from '../commands/updateProfile';
import { saveUser } from '../database/userRepository';
import { parseCookies, fetchGameData, getUserProfile } from '../hoyolab/profileUtils';
import { ChatInputCommandInteraction } from 'discord.js';

describe('Unit Tests for Update Profile Command', () => {
    const mockInteraction = {
        deferReply: jest.fn(),
        editReply: jest.fn(),
        options: {
            getString: jest.fn(),
        },
        user: { id: '12345' },
    } as unknown as ChatInputCommandInteraction;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reply with an error if the profile does not exist', async () => {
        (mockInteraction.options.getString as jest.Mock).mockImplementation((option) => {
            if (option === 'profile') return 'testProfile';
            if (option === 'cookies') return 'testCookies';
        });
        (getUserProfile as jest.Mock).mockResolvedValue(null);

        await updateProfileCommand(mockInteraction);

        expect(getUserProfile).toHaveBeenCalledWith('12345', 'testProfile');
        expect(mockInteraction.editReply).toHaveBeenCalledWith({
            content: 'No profile found with the nickname `testProfile`.',
        });
    });

    it('should reply with an error if cookies are invalid', async () => {
        (mockInteraction.options.getString as jest.Mock).mockImplementation((option) => {
            if (option === 'profile') return 'testProfile';
            if (option === 'cookies') return 'testCookies';
        });
        (getUserProfile as jest.Mock).mockResolvedValue({
            user: { profiles: [] },
            profileIndex: 0,
        });
        (parseCookies as jest.Mock).mockReturnValue({});
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: '',
        });

        await updateProfileCommand(mockInteraction);

        expect(fetchGameData).toHaveBeenCalledWith('testCookies');
        expect(mockInteraction.editReply).toHaveBeenCalledWith({
            content: 'No data was found for the provided cookies. Please ensure they are correct.',
        });
    });

    it('should update the profile and save the user if cookies are valid', async () => {
        (mockInteraction.options.getString as jest.Mock).mockImplementation((option) => {
            if (option === 'profile') return 'testProfile';
            if (option === 'cookies') return 'testCookies';
        });
        (getUserProfile as jest.Mock).mockResolvedValue({
            user: { profiles: [{ nickname: 'testProfile' }] },
            profileIndex: 0,
        });
        (parseCookies as jest.Mock).mockReturnValue({ test: 'parsedCookie' });
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [{ uid: 123456 }],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: 'Mocked game data fetch successful!',
        });

        await updateProfileCommand(mockInteraction);

        expect(parseCookies).toHaveBeenCalledWith('testCookies');
        expect(fetchGameData).toHaveBeenCalledWith('testCookies');
        expect(saveUser).toHaveBeenCalledWith(
            expect.objectContaining({
                profiles: expect.arrayContaining([
                    expect.objectContaining({
                        nickname: 'testProfile',
                        genshin: expect.arrayContaining([{ uid: 123456 }]),
                    }),
                ]),
            })
        );
        expect(mockInteraction.editReply).toHaveBeenCalledWith({
            content: expect.stringContaining('Profile `testProfile` updated successfully.'),
        });
    });
});
