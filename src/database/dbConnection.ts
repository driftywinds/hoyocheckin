import {MongoClient, Db} from 'mongodb';

let db: Db;
export const connectToDatabase = async (MONGO_URI: string, DATABASE_NAME: string): Promise<Db> => {
    if(!db){
        console.log('Connecting to MongoDB...');
        const client: MongoClient = new MongoClient(MONGO_URI);
        await client.connect();
        db = client.db(DATABASE_NAME);
        console.log('Connected to MongoDB');
    }
    return db;
}
