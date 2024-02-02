import { User, readUsersFromFile } from "../bot";
import { redeemGenshinCode } from "../genshin/redeem_genshin";

type RedeemFunctions = {
    [key: string]: (user: User, code: string) => Promise<string | undefined>;
};

const redeemFunctions: RedeemFunctions = {
    genshin: async (user, code) => redeemGenshinCode(user, code),
    // Add other game functions here
};

export async function redeemCode(game: string, code: string, user: User): Promise<string> {
    try {
        const redeemFunction = redeemFunctions[game.toLowerCase()];
        if (redeemFunction) {
            try {
                const response = await redeemFunction(user, code);
                return response || 'Error redeeming code';
            } catch (error) {
                console.error(`Error redeeming code ${code} for user ${user.discord_id}: ${error}`);
                return 'Error redeeming code';
            }
        } else {
            return 'Unknown game';
        }
    } catch (error) {
        console.error('Error redeeming code:', error);
        return 'Error redeeming code';
    }
}

export async function redeemForAllUsers(game: string, code: string): Promise<void> {
    try {
        const users: User[] = readUsersFromFile('./userData.json');
        const redeemFunction = redeemFunctions[game.toLowerCase()];
        if (redeemFunction) {
            for (const user of users) {
                try {
                    await redeemFunction(user, code);
                } catch (error) {
                    console.error(`Error redeeming code ${code} for user ${user.discord_id}: ${error}`);
                }
            }
        } else {
            console.error(`Unknown game: ${game}`);
        }
    } catch (error) {
        console.error(`Error reading users from file: ${error}`);
    }
}
