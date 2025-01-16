export interface User {
    username: string;
    discord_id: string;
    profiles: Profile[];
}

// Create profile object
export interface Profile {
    nickname: string;
    genshin: UID[];
    hk_str: UID[];
    hk_imp: UID[];
    zzz: UID[];
    pasted_cookie: Record<string, string>;
    raw_cookie: string;
}

// Create uid object for user's profiles
export interface UID {
    region: string;
    region_name: string;
    gameUid: number;
    nickname: string;
    level: number;
}
