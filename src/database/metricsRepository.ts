import { Collection } from 'mongodb';
import { connectToDatabase} from "./dbConnection";
import { config } from "../bot";

export let metricsCollection: Collection;

// Initialize the users collection
export const initMetricsCollection = async () => {
    if(!metricsCollection){
        const db = await connectToDatabase(config.MONGO_URI, config.DATABASE_NAME);
        metricsCollection = db.collection('metrics');
    }
};

export const updateMetric = async (name: string, value: number) => {
    await initMetricsCollection();
    await metricsCollection.updateOne(
        { name },
        { $set: { value, last_updated: new Date() } },
        { upsert: true }
    );
}

export const incrementMetric = async (name: string, increment: number = 1) => {
    await initMetricsCollection();
    await metricsCollection.updateOne(
        { name },
        { $inc: { value: increment }, $set: { last_updated: new Date() } },
        { upsert: true }
    );
}

export const decrementMetric = async (name: string, decrement: number = -1) => {
    await initMetricsCollection();
    await metricsCollection.updateOne(
        { name },
        { $inc: { value: decrement }, $set: { last_updated: new Date() } },
        { upsert: true }
    );
}

export const getMetric = async (name: string) => {
    await initMetricsCollection();
    return await metricsCollection.findOne({ name });
}