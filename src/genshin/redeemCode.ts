import { stringify } from "querystring";
import { User, UID } from "../bot";

export async function redeemGenshinCode(user: User, code: string) {

    const uids: UID[] = user.genshin;

    const user_cookies = stringify(user.pasted_cookie);
    const header = {
        Cookie: user_cookies,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Referer': 'https://act.hoyolab.com/',
        'Origin': 'https://act.hoyolab.com',
    };

    const options: RequestInit = {
        method: 'GET',
        headers: header,
    };

    try {

        for(const uid of uids){

            const url = `https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey?uid=${uid.gameUid}&region=${uid.region}&lang=en&cdkey=${code}&game_biz=hk4e_global&sLangKey=en-us`;
            console.log(`Redeeming ${code} for ${user.username} for region ${uid.region}`);
            const hoyolabResponse: Response = await fetch(url, options);
            const responseJson = await hoyolabResponse.json();
            
            console.log(responseJson.message+'\n');
        }

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}
