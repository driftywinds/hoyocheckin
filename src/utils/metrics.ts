import { Counter, Gauge, Registry} from "prom-client";

export const register = new Registry();

// Gauge to track the total number of users registered
export const totalUsersGauge = new Gauge({
    name: 'total_users',
    help: 'Total number of users registered',
    registers: [register],
});

// Update the user gauge periodically
export const updateTotalUsers = (totalUsers: number) => {
    totalUsersGauge.set(totalUsers);
};

export const successfullRegisterCounter = new Gauge({
    name: 'successful_register',
    help: 'Total number of successful register',
    registers: [register],
});

export const incrementSuccessfullRegister = () => {
    successfullRegisterCounter.inc();
}

export const invalidCookiesCounter = new Counter({
    name: 'invalid_cookies',
    help: 'Total number of invalid cookies',
    registers: [register],
});

export const incrementInvalidCookies = () => {
    invalidCookiesCounter.inc();
}

export const duplicateNameCounter = new Counter({
    name: 'duplicate_name',
    help: 'Total number of duplicate names',
    registers: [register],
});

export const incrementDuplicateName = () => {
    duplicateNameCounter.inc();
}

// Gauge to track the total number of profiles registered
export const totalProfilesGauge = new Gauge({
    name: 'total_profiles',
    help: 'Total number of profiles registered',
    registers: [register],
});

export const incrementTotalProfiles = () => {
    totalProfilesGauge.inc();
}

export const decrementTotalProfiles = () => {
    totalProfilesGauge.dec();
}

// Gauge to track the total number of guilds the bot is in
export const totalGuildsGauge = new Gauge({
    name: 'total_guilds',
    help: 'Total number of guilds the bot is in',
    registers: [register],
});

// Update the guild gauge periodically
export const updateTotalGuilds = (guildCount: number) => {
    totalGuildsGauge.set(guildCount);
};

// Counter to track the total number of commands executed
export const commandCounter = new Counter({
    name: 'command_counter',
    help: 'Total number of commands executed',
    labelNames: ['command'],
    registers: [register],
});

// Increment the counter whenever a command is executed
export const trackCommandUsage = (commandName: string) => {
    commandCounter.labels(commandName).inc();
};

// Counter to track the total number of errors encountered
export const errorCounter = new Counter({
    name: 'error_counter',
    help: 'Total number of errors encountered',
    labelNames: ['error_type'],
    registers: [register],
});

// Increment the counter whenever an error occurs
export const trackError = (errorType: string) => {
    errorCounter.labels(errorType).inc();
};

// Gauge to track the bot's heartbeat
export const botHeartbeatGauge = new Gauge({
    name: 'bot_heartbeat',
    help: 'Bot heartbeat',
    registers: [register],
});

// Update the bot's heartbeat periodically
export const updateBotHeartbeat = () => {
    botHeartbeatGauge.set(Date.now() / 1000);
};