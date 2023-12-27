import { readUsersFromFile, User } from "../bot";
import { redeemGenshinCode } from "../genshin/redeemCode";

export async function redeemForAllUsers(game: string, code: string){

    const users:User[] = readUsersFromFile('./userData.json');

    if(game.toLowerCase() == 'genshin'){
        users.map(user => redeemGenshinCode(user, code));
    }

}