import { DMChannel } from "discord.js";

import {UID} from "../../types";

export async function getUserZenlessInfo(cookie: string, dmChannel?: DMChannel): Promise<UID[]> {
    const regionsURLS = [
        { region: 'os_usa', url: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken?t=1720306647686&game_biz=nap_global&region=prod_gf_us' },
        { region: 'os_euro', url: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken?t=1720306714052&game_biz=nap_global&region=prod_gf_eu' },
        { region: 'os_asia', url: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken?t=1720306679420&game_biz=nap_global&region=prod_gf_jp'},
        { region: 'os_cht', url: 'https://api-account-os.hoyoverse.com/account/binding/api/getUserGameRolesOfRegionByCookieToken?t=1720306737094&game_biz=nap_global&region=prod_gf_sg' }
    ];

    const header = {
        Cookie: cookie,
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

    const successfulRegions: UID[] = [];

    try {
        for (const { region, url } of regionsURLS) {
            const hoyolabResponse: Response = await fetch(url, options);

            if (!hoyolabResponse.ok) {
                console.error(`Request for region ${region} failed with status:`, hoyolabResponse.status);
                const errorResponseText = await hoyolabResponse.text();
                console.error('Error response:', errorResponseText);
                continue;
            }

            const responseJson = await hoyolabResponse.json();

            // The request was successful and data.list is not empty
            if (responseJson.retcode === 0 && responseJson.data.list.length > 0) {

                const characterInfo = responseJson.data.list[0];

                const gameUid = characterInfo.game_uid;
                const nickname = characterInfo.nickname;
                const level:number = characterInfo.level;
                const region_name = characterInfo.region_name;

                console.log(`Found UID for user in ${region}`);

                if(dmChannel){

                    dmChannel.send(`**ZENLESS ZONE ZERO ACCOUNT FOUND |**\nServer: __${region_name}__\nNickname: __${nickname}__\nlvl: __${level}__`);
                }

                // Store the information for successful regions
                successfulRegions.push({ region, gameUid, nickname, level, region_name });
            } else {
                console.error(`Could not find UID for user in ${region}`);
            }
        }

        // return regions and their respective UIDs
        return successfulRegions;
    } catch (error) {
        console.error('Error during fetch:', error);
        return [];
    }
}
