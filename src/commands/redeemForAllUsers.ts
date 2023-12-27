import { readUsersFromFile, User } from "../bot";
import { redeemGenshinCode } from "../genshin/redeemCode";

export async function redeemForAllUsers(game: string, code: string): Promise<void> {
    try {
        const users: User[] = readUsersFromFile('./userData.json');

        if (game.toLowerCase() === 'genshin') {
            users.forEach(async (user) => {
                try {
                    await redeemGenshinCode(user, code);
                } catch (error) {
                    console.error(`Error redeeming code ${code} for user ${user.user_id}: ${error}`);
                }
            });
        }
    } catch (error) {
        console.error(`Error reading users from file: ${error}`);
    }
}
