jest.mock('../database/userRepository', () => ({
    findUserByDiscordId: jest.fn(),
    deleteProfile: jest.fn(),
}));
jest.mock('../database/metricsRepository', () => ({
    updateMetric: jest.fn(),
    incrementMetric: jest.fn(),
    decrementMetric: jest.fn(),
    initMetricsCollection: jest.fn(),
}));


import { deleteProfileCommand, deleteProfileConfirm } from '../commands/delete';
import { findUserByDiscordId, deleteProfile } from '../database/userRepository';
import { ChatInputCommandInteraction, ButtonInteraction } from 'discord.js';

describe('Unit Tests for Delete Command', () => {
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should reply with an error if the user has no profiles', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue(null);
        (mockCommandInteraction.options.getString as jest.Mock).mockReturnValue('testProfile');

        await deleteProfileCommand(mockCommandInteraction);

        expect(findUserByDiscordId).toHaveBeenCalledWith('12345');
        expect(mockCommandInteraction.reply).toHaveBeenCalledWith({
            content: 'You do not have a profile named `testProfile`.',
            flags: expect.anything(),
        });
    });

    it('should prompt confirmation if the profile exists', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [{ nickname: 'testProfile' }],
        });
        (mockCommandInteraction.options.getString as jest.Mock).mockReturnValue('testProfile');

        await deleteProfileCommand(mockCommandInteraction);

        expect(findUserByDiscordId).toHaveBeenCalledWith('12345');
        expect(mockCommandInteraction.reply).toHaveBeenCalledWith(
            expect.objectContaining({
                embeds: expect.any(Array),
                components: expect.any(Array),
            })
        );
    });

    it('should delete the profile on confirmation', async () => {
        await deleteProfileConfirm(mockButtonInteraction);

        expect(mockButtonInteraction.deferReply).toHaveBeenCalled();
        expect(deleteProfile).toHaveBeenCalledWith('12345', 'testProfile');
        expect(mockButtonInteraction.editReply).toHaveBeenCalledWith({
            content: 'Profile testProfile has been deleted.',
        });
    });
});
