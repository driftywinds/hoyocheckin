export async function redeemCode(token: string, code: string, uid: string) {
    const url = `https://sg-hk4e-api.hoyoverse.com/common/apicdkey/api/webExchangeCdkey?uid=${uid}&region=os_usa&lang=en&cdkey=${code}&game_biz=hk4e_global&sLangKey=en-us`;

    const header = {
        Cookie: token,
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
        const hoyolabResponse: Response = await fetch(url, options);
        const responseJson = await hoyolabResponse.json();
        
        const checkInResult: string = responseJson.message;

        console.log(checkInResult);

    } catch (error) {
        console.error('Error during fetch:', error);
    }
}
