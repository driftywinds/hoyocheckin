import { Counter, Gauge, Registry} from "prom-client";
import {
    decrementMetric,
    incrementMetric,
    updateMetric,
    metricsCollection,
    initMetricsCollection
} from "../database/metricsRepository";
import logger from "./logger";


export const register = new Registry()

export const totalCheckinsCounter = new Counter({
    name: 'total_checkins',
    help: 'Total number of checkins',
    registers: [register],
});

export const incrementTotalCheckins = async () => {
    totalCheckinsCounter.inc();
    await incrementMetric('total_checkins');
}

// Gauge to track the total number of users registered
export const totalUsersGauge = new Gauge({
    name: 'total_users',
    help: 'Total number of users registered',
    registers: [register],
});

// Update the user gauge periodically
export const updateTotalUsers = async (totalUsers: number) => {
    totalUsersGauge.set(totalUsers);
    await updateMetric('total_users', totalUsers);
};

export const successfulRegisterCounter = new Gauge({
    name: 'successful_register',
    help: 'Total number of successful register',
    registers: [register],
});

export const incrementSuccessfullRegister = async () => {
    successfulRegisterCounter.inc();
    await incrementMetric('successful_register');
}

export const invalidCookiesCounter = new Counter({
    name: 'invalid_cookies',
    help: 'Total number of invalid cookies',
    registers: [register],
});

export const incrementInvalidCookies = async () => {
    invalidCookiesCounter.inc();
    await incrementMetric('invalid_cookies');
}

export const duplicateNameCounter = new Counter({
    name: 'duplicate_name',
    help: 'Total number of duplicate names',
    registers: [register],
});

export const incrementDuplicateName = async () => {
    duplicateNameCounter.inc();
    await incrementMetric('duplicate_name');
}

// Gauge to track the total number of profiles registered
export const totalProfilesGauge = new Gauge({
    name: 'total_profiles',
    help: 'Total number of profiles registered',
    registers: [register],
});

export const incrementTotalProfiles = async () => {
    totalProfilesGauge.inc();
    await incrementMetric('total_profiles');
}

export const decrementTotalProfiles = async () => {
    totalProfilesGauge.dec();
    await decrementMetric('total_profiles');
}

// Gauge to track the total number of guilds the bot is in
export const totalGuildsGauge = new Gauge({
    name: 'total_guilds',
    help: 'Total number of guilds the bot is in',
    registers: [register],
});

// Update the guild gauge periodically
export const updateTotalGuilds = async (guildCount: number) => {
    totalGuildsGauge.set(guildCount);
    await updateMetric('total_guilds', guildCount);
};

// Counter to track the total number of commands executed
export const commandCounter = new Counter({
    name: 'command_counter',
    help: 'Total number of commands executed',
    labelNames: ['command'],
    registers: [register],
});

// Increment the counter whenever a command is executed
export const trackCommandUsage = async (commandName: string) => {
    commandCounter.labels(commandName).inc();
    await incrementMetric(`command_counter_${commandName}`);
};

// Counter to track the total number of errors encountered
export const errorCounter = new Counter({
    name: 'error_counter',
    help: 'Total number of errors encountered',
    labelNames: ['error_type'],
    registers: [register],
});

// Increment the counter whenever an error occurs
export const trackError = async (errorType: string) => {
    errorCounter.labels(errorType).inc();
    await incrementMetric(`error_counter_${errorType}`);
};

// Gauge to track the bot's heartbeat
export const botHeartbeatGauge = new Gauge({
    name: 'bot_heartbeat',
    help: 'Bot heartbeat',
    registers: [register],
});

// Update the bot's heartbeat periodically
export const updateBotHeartbeat = async () => {
    botHeartbeatGauge.set(Date.now() / 1000);
    await updateMetric('bot_heartbeat', Date.now() / 1000);
};

export async function initMetrics() {
    try {
        await initMetricsCollection();
        const allMetrics = await metricsCollection.find({}).toArray();

        allMetrics.forEach((metric) => {
            const { name, value } = metric;

            // Handle specific metrics
            switch (true) {

                case name === "total_checkins":
                    totalCheckinsCounter.inc(value);
                    break;

                case name === "total_users":
                    totalUsersGauge.set(value);
                    break;

                case name === "total_profiles":
                    totalProfilesGauge.set(value);
                    break;

                case name === "total_guilds":
                    totalGuildsGauge.set(value);
                    break;

                case name === "successful_register":
                    successfulRegisterCounter.set(value);
                    break;

                case name === "invalid_cookies":
                    invalidCookiesCounter.inc(value);
                    break;

                case name === "duplicate_name":
                    duplicateNameCounter.inc(value);
                    break;

                case name.startsWith("command_counter_"):{
                    // Extract the command name
                    const commandName = name.replace("command_counter_", "");
                    commandCounter.labels(commandName).inc(value);
                    break;
                }

                case name.startsWith("error_counter_"): {
                    // Extract the error name
                    const errorName = name.replace("error_counter_", "");
                    errorCounter.labels(errorName).inc(value);
                    break;
                }

                case name === "bot_heartbeat":
                    botHeartbeatGauge.set(value);
                    break;

                default:
                    console.warn(`Unknown metric found in database: ${name}`);
                    break;
            }
        });

        logger.info("Metrics successfully initialized from the database.");
    } catch (error) {
        logger.error("Error initializing metrics from the database:", error);
    }
}