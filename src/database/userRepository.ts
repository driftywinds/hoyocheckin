import { Collection } from 'mongodb';
import { User } from '../types';
import { connectToDatabase} from "./dbConnection";
import { config } from "../bot";

let usersCollection: Collection<User>;

const initUsersCollection = async () => {
    if(!usersCollection){
        const db = await connectToDatabase(config.MONGO_URI, config.DATABASE_NAME);
        usersCollection = db.collection<User>('users');
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    await initUsersCollection();
    return await usersCollection.find({}).toArray();
};

export const findUserByDiscordId = async (discordId: string): Promise<User | null> => {
    await initUsersCollection();
    return await usersCollection.findOne({discord_id: discordId});
}

export const saveUser = async (user: User): Promise<void> => {
    await initUsersCollection();
    await usersCollection.updateOne({
        discord_id: user.discord_id},
        {$set: user},
        {upsert: true});
};