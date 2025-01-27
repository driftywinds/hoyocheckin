# Hoyolab Check-In Discord Bot

This Discord bot automates daily check-ins for Hoyoverse games, including **Genshin Impact**, **Honkai Starrail**, and **Zenless Zone Zero**. By using the bot, users can schedule automated daily check-ins through the Hoyoverse API using their Hoyolab cookies. These cookies do not contain any Personally Identifiable Information (PII).

---

## Adding the Bot to Your Discord Server

To use the bot, invite it to your server using one of the following links:

- [Discord.bots.gg](https://discord.bots.gg/bots/1187619990380232786)
- [Discordbotlist.com](https://discordbotlist.com/bots/daily-checkin-bot)

---

## Enrolling Your Account for Daily Check-Ins

Once the bot is in a server you are part of, follow these steps to register your account:

1. **Use the `/register` command**:
    - This will provide instructions on how to retrieve your Hoyolab cookies.

2. **Click the "Register" button**:
    - Enter your **profile nickname** and your **cookies**.

3. **Confirmation**:
    - If successful, your game information will be displayed, confirming your registration.

4. **Adding Multiple Profiles**:
    - You can add multiple profiles if needed by repeating the registration process with different nicknames.

5. **Refreshing Expired Cookies**:
    - Cookies typically expire after about a year.
    - To refresh them, use the `/update_profile` command and provide new cookies.

---

## Commands Overview

### Check-In
- **Command**: `/checkin`
- **Description**: Manually performs a check-in for all registered profiles.

### Registration
- **Command**: `/register`
- **Description**: Starts the registration process for daily check-ins.

### Update Profile
- **Command**: `/update_profile {profile_nickname} {cookies}`
- **Description**: Refreshes cookies for an existing profile.

### List Profiles
- **Command**: `/list_profiles`
- **Description**: Displays all profiles linked to your Discord account.

### Delete Profile
- **Command**: `/delete {profile_nickname}`
- **Description**: Removes a profile from the bot's database.

---

## Notes
- The bot uses cookies to authenticate with the Hoyoverse API and automate check-ins.
- Please ensure your cookies are valid and properly formatted for the bot to function correctly.
- If you experience any issues or errors, try refreshing your cookies or reach out to the bot administrator.

---

## Contributing

If you would like to contribute to the project, feel free to submit a pull request or open an issue. Your feedback and contributions are always welcome!

---

## Running the bot yourself

### Requirements
- Node.js (v20.x or higher)
- MongoDB (local or cloud-based)
- Discord Bot Token

### Installation
1. Clone the repository: `git clone https://github.com/NickAwrist/Dailycheckin_Bot`
2. Install dependencies: `npm install`
3. Create a `.env` file in the root directory with the following structure
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_bot_client_id
   BOT_ADMIN_ID=your_discord_user_id
   MONGODB_URI=your_mongodb_connection_uri
   DATABASE_NAME=your_mongodb_database_name
   METRICS_PORT=3001
   ``` 
4. Your `.env` file should have the environment type appended to the filename (e.g., `.env.development`, `.env.production`).   
5. You must also have a `.env.encryption` file with the following structure:
   ```env
   ENCRYPTION_KEY=your_32char_encryption_key
   ```
   This key is used to encrypt and decrypt the cookies stored in the database.
6. Start the bot: `npm start`

### Running the bot

**Option 1: Using `npm`**
- Start the bot: `npm start`

**Option 2: Using `docker`**
- Build the Docker image: `docker compose up -d --build`
- To view logs: `docker logs dailycheckin-bot`

### Metrics
- The bot includes a metrics server that provides information on the bot's status and usage via prometheus.
- To access the metrics, visit `http://localhost:3001/metrics` (or the specified `METRICS_PORT`).
- A `prometheus.yml` file is included in the repository for scraping the metrics.