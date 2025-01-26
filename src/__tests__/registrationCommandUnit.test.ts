jest.mock('../database/userRepository', () => ({
    findUserByDiscordId: jest.fn(),
    saveUser: jest.fn(),
}));
jest.mock('../hoyolab/profileUtils', () => ({
    parseCookies: jest.fn(),
    fetchGameData: jest.fn(),
}));
jest.mock('../database/metricsRepository', () => ({
    updateMetric: jest.fn(),
    incrementMetric: jest.fn(),
    decrementMetric: jest.fn(),
    initMetricsCollection: jest.fn(),
}));

import { registerCommand, handleRegistrationSubmit } from '../commands/registration';
import { findUserByDiscordId, saveUser } from '../database/userRepository';
import { parseCookies, fetchGameData } from '../hoyolab/profileUtils';
import { CommandInteraction, ModalSubmitInteraction } from 'discord.js';

describe('Unit Tests for Registration Command', () => {

    const mockCommandInteraction = {
        reply: jest.fn(),
        deferReply: jest.fn(),
        editReply: jest.fn(),
        customId: 'open_registration_modal',
        user: { id: '12345', username: 'testUser' },
        channel: { messages: { fetch: jest.fn() } },
    } as unknown as CommandInteraction;

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

    it('should send registration instructions with an embed', async () => {
        await registerCommand(mockCommandInteraction);

        expect(mockCommandInteraction.reply).toHaveBeenCalledWith(
            expect.objectContaining({
                embeds: expect.any(Array),
                components: expect.any(Array),
            })
        );
    });

    it('should handle registration form submission for a new user', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue(null);
        (mockModalInteraction.fields.getTextInputValue as jest.Mock).mockImplementation((field) => {
            if (field === 'nickname') return 'testNickname';
            if (field === 'cookies') return 'testCookies';
        });
        (parseCookies as jest.Mock).mockReturnValue({ test: 'parsedCookie' });
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [{}],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: 'Mocked response message',
        });

        await handleRegistrationSubmit(mockModalInteraction);

        expect(parseCookies).toHaveBeenCalledWith('testCookies');
        expect(fetchGameData).toHaveBeenCalledWith('testCookies');
        expect(saveUser).toHaveBeenCalledWith(
            expect.objectContaining({
                username: 'testUser',
                discord_id: '12345',
                profiles: expect.any(Array),
            })
        );
        expect(mockModalInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('Successfully registered'),
            })
        );
    });

    it('should handle duplicate nicknames gracefully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [{ nickname: 'testNickname' }],
        });
        (mockModalInteraction.fields.getTextInputValue as jest.Mock).mockImplementation((field) => {
            if (field === 'nickname') return 'testNickname';
        });

        await handleRegistrationSubmit(mockModalInteraction);

        expect(mockModalInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('A profile with the same nickname already exists'),
            })
        );
    });

    it('should handle failed cookie validation', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue(null);
        (mockModalInteraction.fields.getTextInputValue as jest.Mock).mockImplementation((field) => {
            if (field === 'nickname') return 'testNickname';
            if (field === 'cookies') return 'testCookies';
        });
        (parseCookies as jest.Mock).mockReturnValue({ test: 'parsedCookie' });
        (fetchGameData as jest.Mock).mockResolvedValue({
            genshinUIDs: [],
            hkstrUIDs: [],
            zenlessUIDs: [],
            responseMessage: '',
        });

        await handleRegistrationSubmit(mockModalInteraction);

        expect(mockModalInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('No data was found for the cookies provided'),
            })
        );
    });
});
