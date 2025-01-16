import {readUsersFromFile} from '../bot';

import { genshinCheckin } from '../games/genshin/checkin_genshin';
import { hkstrCheckin } from '../games/hk_starrail/checkin_hkstr';
import { zzzCheckin } from '../games/zenless_zone_zero/checkin_zenless';
import {User} from "../types";

export async function checkinAllUsers() {
    try {

        // Gather all user's information from JSON
        const users: User[] = readUsersFromFile();

        for(const user of users){

            console.log(`--Checking in user: ${user.username}--`);

            for(const profile of user.profiles){
                console.log(`--Checking in profile: ${profile.nickname}--`);

                if(profile.genshin.length > 0){
                    console.log('Checking in Genshin Impact');
                    const genshinResult: string = await genshinCheckin(profile);
                    console.log(genshinResult);
                }

                if(profile.hk_str.length > 0){
                    console.log('Checking in Honkai Starrail');
                    const hkstrResult: string = await hkstrCheckin(profile);
                    console.log(hkstrResult);
                }

                if(profile.zzz.length > 0){
                    console.log('Checking in Zenless Zone Zero');
                    const zzzResult: string = await zzzCheckin(profile);
                    console.log(zzzResult);
                }
            }
        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}

