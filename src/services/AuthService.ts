require('dotenv').config()
import fs from 'fs';
import { User } from '../entities/User';
import crypto from 'crypto';


class AuthService {

    generateSessionToken(): string {
        const token = crypto.randomBytes(32).toString("hex");
        return token;
    }

    async AuthenticateUser(
        licenseKey: string,
        username: string,
        publicKey: string,
        encryptedPrivateKey: string,
        expoPushToken: string,
    ): Promise<string | null> {
        try {
            // Try to find the user
            const user = await User.findOneOrFail({
                where: {
                    licenseKey: licenseKey,
                },
            });

            const userWithExpoToken = await User.findOneOrFail({
                where: {
                    expoPushToken: expoPushToken,
                },
            });

            if (userWithExpoToken) {
                userWithExpoToken.expoPushToken = undefined;
                await userWithExpoToken.save();
            }


            user.activeSessionToken = undefined;
            // Generate a new session token
            const newSessionToken = this.generateSessionToken();

            user.activeSessionToken = newSessionToken;
            user.username = username;
            user.publicKey = publicKey;
            user.encryptedPrivateKey = encryptedPrivateKey;
            user.expoPushToken = expoPushToken;

            await user.save();
            // Return the new session token
            return newSessionToken;
        } catch (error) {
            console.error(error);
            return null;
        }
    }



}


export default new AuthService();