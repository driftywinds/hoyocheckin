import { User } from '../bot';
import * as fs from 'fs';

import { genshinCheckin } from '../genshin/checkin_genshin';
import { hkstrCheckin } from '../hk_starrail/checkin_hkstr';
import { zzzCheckin } from '../zenless_zone_zero/checkin_zenless';

export async function checkinAllUsers() {
    try {

        // Gather all user's information from JSON
        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
        const jsonData = JSON.parse(fileContent);
        const userData: User[] = jsonData.users;

        for(const user of userData){

            console.log(`--Checking in user: ${user.nickname}--`);

            console.log('--Genshin Impact--');
            const genshinResult = await genshinCheckin(user);
            console.log(genshinResult);

            console.log('--Honkai Starrail--');
            const hkstrResult = await hkstrCheckin(user);
            console.log(hkstrResult);
            console.log('\n');

            console.log('--Zenless Zone Zero--');
            const zzzResult = await zzzCheckin(user);
            console.log(zzzResult);
            console.log('\n');

        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}

