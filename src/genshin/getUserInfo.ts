export async function getUserInfo(token:string){
    const url = 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesByCookieToken?lang=en&region=os_usa&game_biz=hk4e_global&sLangKey=en-us';

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
    
        if (!hoyolabResponse.ok) {
            console.error('Request failed with status:', hoyolabResponse.status);
            const errorResponseText = await hoyolabResponse.text();
            console.error('Error response:', errorResponseText);
            return;
        }
    
        const responseJson = await hoyolabResponse.json();
    
        if (responseJson.retcode === 0) {
            // The request was successful, proceed to extract game_uid
            const gameUid = responseJson.data.list[0].game_uid;
            console.log('Game UID:', gameUid);
        } else {
            // Handle other response codes if needed
            console.error('Request failed with message:', responseJson.message);
        }
    } catch (error) {
        console.error('Error during fetch:', error);
    }




}