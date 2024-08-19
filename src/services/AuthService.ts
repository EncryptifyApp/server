require('dotenv').config()
import fs from 'fs';
import { User } from '../entities/User';
import crypto from 'crypto';
//@ts-ignore
import { FileUpload } from "graphql-upload";

class AuthService {

  generateSessionToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    return token;
  }

  async AuthenticatedUser(
    licenseKey: string,
    username: string,
    publicKey: string,
    encryptedPrivateKey: string,
    expoPushToken: string,
    profilePic: FileUpload | null
): Promise<string | null> {
    try {
        // Try to find the user
        const user = await User.findOneOrFail({
            where: {
                licenseKey: licenseKey,
            },
        });

        // Generate a new session token
        const newSessionToken = this.generateSessionToken();

        user.activeSessionToken = newSessionToken;
        user.username = username;
        user.publicKey = publicKey;
        user.encryptedPrivateKey = encryptedPrivateKey;
        user.expoPushToken = expoPushToken;

        // Handle the profile picture if provided
        if (profilePic) {
            const { createReadStream, filename } = await profilePic;
            const stream = createReadStream();
            const path = `./uploads/${filename}`;
            await new Promise((resolve, reject) =>
                stream
                    .pipe(fs.createWriteStream(path))
                    .on("finish", resolve)
                    .on("error", reject)
            );
            user.profileUrl = path;
        }

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