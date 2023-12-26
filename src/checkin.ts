import { User } from './bot';
import * as fs from 'fs';

import { genshinCheckIn } from './genshin/dailyCheckIn';

export async function checkInAllUsers() {
    try {

        // Gather all user's information from JSON
        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
        const jsonData = JSON.parse(fileContent);
        const userData: User[] = jsonData.users;

        // For every user, use their tokes to sign them in
        for(const user of userData){

            const result = await genshinCheckIn(user);

            // Print the result
            console.log(result);
        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}

