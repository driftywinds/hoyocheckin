jest.mock('../games/genshin/checkin_genshin', () => ({
    genshinCheckin: jest.fn(),
}));
jest.mock('../games/hk_starrail/checkin_hkstr', () => ({
    hkstrCheckin: jest.fn(),
}));
jest.mock('../games/zenless_zone_zero/checkin_zenless', () => ({
    zzzCheckin: jest.fn(),
}));
jest.mock('../database/userRepository', () => ({
    findUserByDiscordId: jest.fn(),
}));
jest.mock('../database/metricsRepository', () => ({
    updateMetric: jest.fn(),
    incrementMetric: jest.fn(),
    decrementMetric: jest.fn(),
    initMetricsCollection: jest.fn(),
}));

import { checkinCommand } from '../commands/checkinCommand';
import { genshinCheckin } from '../games/genshin/checkin_genshin';
import { hkstrCheckin } from '../games/hk_starrail/checkin_hkstr';
import { zzzCheckin } from '../games/zenless_zone_zero/checkin_zenless';
import { findUserByDiscordId } from '../database/userRepository';
import { CommandInteraction } from 'discord.js';

describe('checkinCommand', () => {
    const mockInteraction = {
        user: { id: '12345' },
        deferReply: jest.fn(),
        editReply: jest.fn(),
    } as unknown as CommandInteraction;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should prompt user to register if not found in database', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue(null);

        await checkinCommand(mockInteraction);

        expect(mockInteraction.deferReply).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith({
            content: 'User not found. Please register first using /register',
        });
    });

    it('should check in Genshin Impact successfully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [{}], hk_str: [], zzz: [] },
            ],
        });
        (genshinCheckin as jest.Mock).mockResolvedValue('Check-in completed successfully.');

        await checkinCommand(mockInteraction);

        expect(genshinCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('Check-in completed successfully.'),
            })
        );
    });

    it('should handle Genshin Impact check-in errors gracefully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [{}], hk_str: [], zzz: [] },
            ],
        });
        (genshinCheckin as jest.Mock).mockRejectedValue(new Error('Failed to check in.'));

        await checkinCommand(mockInteraction);

        expect(genshinCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('An error occurred during the check-in process.'),
            })
        );
    });

    it('should check in Honkai Starrail successfully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [], hk_str: [{}], zzz: [] },
            ],
        });
        (hkstrCheckin as jest.Mock).mockResolvedValue('Check-in completed successfully.');

        await checkinCommand(mockInteraction);

        expect(hkstrCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('Check-in completed successfully.'),
            })
        );
    });

    it('should handle Honkai Starrail check-in errors gracefully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [], hk_str: [{}], zzz: [] },
            ],
        });
        (hkstrCheckin as jest.Mock).mockRejectedValue(new Error('Failed to check in.'));

        await checkinCommand(mockInteraction);

        expect(hkstrCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('An error occurred during the check-in process.'),
            })
        );
    });

    it('should check in Zenless Zone Zero successfully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [], hk_str: [], zzz: [{}] },
            ],
        });
        (zzzCheckin as jest.Mock).mockResolvedValue('Check-in completed successfully.');

        await checkinCommand(mockInteraction);

        expect(zzzCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('Check-in completed successfully.'),
            })
        );
    });

    it('should handle Zenless Zone Zero check-in errors gracefully', async () => {
        (findUserByDiscordId as jest.Mock).mockResolvedValue({
            profiles: [
                { nickname: 'testUser', genshin: [], hk_str: [], zzz: [{}] },
            ],
        });
        (zzzCheckin as jest.Mock).mockRejectedValue(new Error('Failed to check in.'));

        await checkinCommand(mockInteraction);

        expect(zzzCheckin).toHaveBeenCalled();
        expect(mockInteraction.editReply).toHaveBeenCalledWith(
            expect.objectContaining({
                content: expect.stringContaining('An error occurred during the check-in process.'),
            })
        );
    });
});