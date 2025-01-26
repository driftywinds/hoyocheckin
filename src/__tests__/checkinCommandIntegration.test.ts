import {Profile} from "../types";
import {genshinCheckin} from "../games/genshin/checkin_genshin";
import {hkstrCheckin} from "../games/hk_starrail/checkin_hkstr";
import {zzzCheckin} from "../games/zenless_zone_zero/checkin_zenless";

describe('Check-In API Integration Tests', () => {

    const testProfile: Profile = {
        nickname: 'testUser',
        genshin: [],
        hk_str: [],
        zzz: [],
        pasted_cookie: {
            ltoken_v2: 'TEST',
            ltuid_v2: 'TEST',
        },
        raw_cookie: 'TEST',
    };

    it('should call the Genshin API and return a successful response', async () => {
        const result: string = await genshinCheckin(testProfile);

        console.log('Genshin API Response:', result);
        expect(result).toContain('Check-in completed');
    });

    it('should call the Honkai Starrail API and return a successful response', async () => {
        const result: string = await hkstrCheckin(testProfile);

        console.log('Honkai Starrail API Response:', result);
        expect(result).toContain('Check-in completed');
    });

    it('should call the Zenless Zone Zero API and return a successful response', async () => {
        const result: string = await zzzCheckin(testProfile);

        console.log('Zenless Zone Zero API Response:', result);
        expect(result).toContain('Check-in completed');
    });
});
