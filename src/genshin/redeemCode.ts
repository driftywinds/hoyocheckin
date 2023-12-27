import { User, UID } from "../bot";

export async function redeemGenshinCode(user: User, code: string) {

    const uids: UID[] = user.genshin;

    const user_cookies = 'cookie_token_v2='+user.pasted_cookie.cookie_token_v2+';'+'account_mid_v2='+user.pasted_cookie.account_mid_v2+';'+'account_id_v2='+user.pasted_cookie.account_id_v2+';';
    
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

            console.log(responseJson);
            if(responseJson.data){
                console.log('sending msg');
                return responseJson.data.msg;
            }
            
            return responseJson.message;
        }

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}
