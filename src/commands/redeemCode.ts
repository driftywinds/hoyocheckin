import { User } from "../bot";
import { redeemGenshinCode } from "../genshin/redeemCode";

export async function redeemCode(game: string, code: string, user: User): Promise<string> {
    try {
        if (game.toLowerCase() === 'genshin') {
            const result = await redeemGenshinCode(user, code);
            return result !== undefined ? result : 'Error redeeming code';
        }

        return 'Unknown game';
    } catch (error) {
        console.error('Error redeeming code:', error);
        return 'Error redeeming code';
    }
}
