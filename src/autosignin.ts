import { User } from './bot';
import * as fs from 'fs';

import { genshinCheckIn } from './genshin/dailycheckin';

export async function checkInAllUsers() {
    try {

        // Gather all user's information from JSON
        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
        const jsonData = JSON.parse(fileContent);
        const userData: User[] = jsonData.users;

        // For every user, use their tokes to sign them in
        for(const user of userData){
            const { username, ltoken_v2, ltuid_v2 } = user;

            const result = await genshinCheckIn(`ltoken_v2=${ltoken_v2}; ltuid_v2=${ltuid_v2};`, username);

            // Print the result
            console.log(result);
        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}