import { findUserByDiscordId } from '../database/userRepository';
import { getUserGenshinInfo } from '../games/genshin/getUserInfo_genshin';
import { getUserStarrailInfo } from '../games/hk_starrail/getUserInfo_hkstr';
import { getUserZenlessInfo } from '../games/zenless_zone_zero/getUserInfo_zenless';
import { UID, User } from '../types';
import logger from "../logger";

/**
 * Retrieve a user's profile by Discord ID and nickname.
 * @param discordId - The Discord user ID.
 * @param profileName - The nickname of the profile to retrieve.
 * @returns The user and profile index if found, or null if not found.
 */
export async function getUserProfile(discordId: string, profileName: string): Promise<{ user: User; profileIndex: number } | null> {
    const user = await findUserByDiscordId(discordId);
    if (!user || !user.profiles) return null;

    const profileIndex = user.profiles.findIndex(profile => profile.nickname === profileName);
    if (profileIndex === -1) return null;

    return { user, profileIndex };
}

/**
 * Parse a raw cookie string into a JSON object.
 * @param rawCookie - The raw cookie string.
 * @returns A parsed JSON object of cookies.
 */
export function parseCookies(rawCookie: string): Record<string, string> {
    const cookiePairs = rawCookie.split(';').map(pair => pair.trim().split('='));
    const cookieJSON: Record<string, string> = {};
    cookiePairs.forEach(([key, value]) => {
        cookieJSON[key] = value;
    });
    return cookieJSON;
}

/**
 * Fetch user game data using cookies.
 * @param cookies - The cookies string for authentication.
 * @returns Game data from Genshin Impact, Honkai Starrail, and Zenless Zone Zero.
 */
export async function fetchGameData(cookies: string): Promise<{ genshinUIDs: UID[]; hkstrUIDs: UID[]; zenlessUIDs: UID[]; responseMessage: string }> {
    let responseMessage = '';

    logger.info('--Fetching Genshin Impact Data');
    const genshinUIDs = await getUserGenshinInfo(cookies);
    if (genshinUIDs.length > 0) {
        responseMessage += 'Found the following Genshin Impact data:\n\n';
        genshinUIDs.forEach(uid => {
            responseMessage += `Region: **${uid.region_name}**\nNickname: **${uid.nickname}**\nLevel: **${uid.level}**\n\n`;
        });
    }

    logger.info('--Fetching Honkai Starrail Data');
    const hkstrUIDs = await getUserStarrailInfo(cookies);
    if (hkstrUIDs.length > 0) {
        responseMessage += 'Found the following Honkai Starrail data:\n\n';
        hkstrUIDs.forEach(uid => {
            responseMessage += `Region: **${uid.region_name}**\nNickname: **${uid.nickname}**\nLevel: **${uid.level}**\n\n`;
        });
    }

    logger.info('--Fetching Zenless Zone Zero Data');
    const zenlessUIDs = await getUserZenlessInfo(cookies);
    if (zenlessUIDs.length > 0) {
        responseMessage += 'Found the following Zenless Zone Zero data:\n\n';
        zenlessUIDs.forEach(uid => {
            responseMessage += `Region: **${uid.region_name}**\nNickname: **${uid.nickname}**\nLevel: **${uid.level}**\n\n`;
        });
    }

    return { genshinUIDs, hkstrUIDs, zenlessUIDs, responseMessage };
}
