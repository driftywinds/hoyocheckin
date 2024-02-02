import { User } from '../bot';
import * as fs from 'fs';

import { genshinCheckin } from '../genshin/checkin_genshin';
import { hkstrCheckin } from '../hk_starrail/checkin_hkstr';

export async function checkinAllUsers() {
    try {

        // Gather all user's information from JSON
        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
        const jsonData = JSON.parse(fileContent);
        const userData: User[] = jsonData.users;

        // For every user, use their tokes to sign them in
        for(const user of userData){

            console.log(`--Checking in user: ${user.username}--`);

            console.log('--Genshin Impact--');
            const genshinResult = await genshinCheckin(user);
            console.log(genshinResult);

            console.log('--Honkai Starrail--');
            const hkstrResult = await hkstrCheckin(user);
            console.log(hkstrResult);

        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}

