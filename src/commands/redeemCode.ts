import { User } from "../bot";

import { redeemGenshinCode } from "../genshin/redeemCode";

export async function redeemCode(game: string, code: string, user: User): Promise<string>{

    try{

        if(game.toLowerCase() == 'genshin'){
            return redeemGenshinCode(user, code);
        }

        return('Unknown game');

    }catch(error){
        console.error('Error redeeming code');
        return 'Error redeeming code';
    }

}