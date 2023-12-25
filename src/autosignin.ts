import { User } from './bot';
import * as fs from 'fs';

import { genshinCheckIn } from './genshin/dailycheckin';

export async function checkInAllUsers() {
    try {
        const fileContent: string = fs.readFileSync('userData.json', 'utf8');
        const userData: User[] = Array.isArray(JSON.parse(fileContent)) ? JSON.parse(fileContent) : [JSON.parse(fileContent)];

        for(const user of userData){
            const { username, ltoken_v2, ltuid_v2 } = user;

            const result = await genshinCheckIn(`ltoken_v2=${ltoken_v2}; ltuid_v2=${ltuid_v2};`, username);

            console.log(result);
        }
    } catch(error){
        console.error('Error reading or parsing userData.json:', error);
    }
}