import {readUsersFromFile, User} from '../bot';

import { genshinCheckin } from '../genshin/checkin_genshin';
import { hkstrCheckin } from '../hk_starrail/checkin_hkstr';
import { zzzCheckin } from '../zenless_zone_zero/checkin_zenless';

export async function checkinAllUsers() {
    try {

        // Gather all user's information from JSON
        const users: User[] = readUsersFromFile();

        for(const user of users){

            console.log(`--Checking in user: ${user.username}--`);

            for(const profile of user.profiles){
                console.log(`--Checking in profile: ${profile.nickname}--`);

                console.log('Checking in Genshin Impact');
                const genshinResult = await genshinCheckin(profile);
                console.log(genshinResult);

                console.log('Checking in Honkai Starrail');
                const hkstrResult = await hkstrCheckin(profile);
                console.log(hkstrResult);

                console.log('Checking in Zenless Zone Zero');
                const zzzResult = await zzzCheckin(profile);
                console.log(zzzResult);
                console.log('\n');
            }

            console.log('\n');
        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}

