import dotenv from "dotenv";
import { connectToDatabase } from "./database/dbConnection";
import { getAllUsers, saveUser } from "./database/userRepository";
import { encrypt, encryptParsedCookies } from "./utils/encryption";
import { User } from "./types";

// Load environment variables
dotenv.config({ path: `.env.development` });

async function encryptUserCookies(): Promise<void> {
    try {
        console.log("Connecting to the database...");
        await connectToDatabase(process.env.MONGO_URI || "", process.env.DATABASE_NAME || "");

        console.log("Fetching all users from the database...");
        const users: User[] = await getAllUsers();

        console.log(`Found ${users.length} users. Encrypting cookies...`);

        for (const user of users) {
            let profilesUpdated = false;

            for (const profile of user.profiles) {
                // Encrypt raw_cookie
                if (profile.raw_cookie) {
                    profile.raw_cookie = encrypt(profile.raw_cookie);
                    profilesUpdated = true;
                }

                // Encrypt pasted_cookie values
                if (profile.pasted_cookie) {
                    profile.pasted_cookie = encryptParsedCookies(profile.pasted_cookie);
                    profilesUpdated = true;
                }
            }

            // Save the updated user only if any profile was modified
            if (profilesUpdated) {
                console.log(`Encrypting cookies for user: ${user.username} (${user.discord_id})`);
                await saveUser(user);
                console.log(`Successfully updated cookies for user: ${user.username}`);
            }
        }

        console.log("All user cookies have been successfully encrypted.");
    } catch (error) {
        console.error("An error occurred while encrypting user cookies:", error);
    }
}

// Execute the script
encryptUserCookies().catch((err) => {
    console.error("Error during script execution:", err);
});
