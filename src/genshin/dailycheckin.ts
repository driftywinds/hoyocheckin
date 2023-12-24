export async function autoSignFunction(token: string, username: string): Promise<string> {
    
    const url = 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=en-us&act_id=e202102251931481';
  
    if (!url) {
      return `Check-in skipped for ${username}: Genshin Impact check-in is disabled.`;
    }

    const header: Record<string, string> = {
        Cookie: token,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'x-rpc-app_version': '2.34.1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'x-rpc-client_type': '4',
        'Referer': 'https://act.hoyolab.com/',
        'Origin': 'https://act.hoyolab.com',
    };
  
    const options: RequestInit = {
      method: 'POST',
      headers: header,
    };
  
    try {
        const hoyolabResponse: Response = await fetch(url, options);
        const responseJson = await hoyolabResponse.json();
        const checkInResult: string = responseJson.message;

        let response:string = `Check-in completed for ${username}`+`\n${checkInResult}`+'\n';
        console.log(response);

        return response;
    } catch (error) {
        console.error('Error during fetch:', error);
        return `Error during fetch for ${username}: `;
    }
}