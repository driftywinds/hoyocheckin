import { GenshinImpact, LanguageEnum } from 'hoyoapi'

import { autoSignFunction } from './test';

export async function genshin_checkin(cookie:string) {
    // const user = new GenshinImpact({
    //     cookie: cookie,
    //     lang: LanguageEnum.ENGLISH,
    // });

    //console.log(`user=${user}`);

    const test = {
        token: "ltoken_v2=v2_CAISDGNlMXRidXdiMDB6axokZGYzMjBhN2QtNmY1Mi00MDkyLTgwYmMtZWYyNGRjODkwOTY3IMjNnawGKPqN1_kDMJ2W3j9CC2hrNGVfZ2xvYmFs; ltuid_v2=133663517;",
        genshin: true,
        accountName: "TEST USER"
    };

    const claim = await autoSignFunction(test);
    console.log(claim);

    return claim;
}