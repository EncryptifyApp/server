require('dotenv').config()

import { User } from '../entities/User';
import crypto from 'crypto';

class AuthService {

  generateSessionToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    return token;
  }

  async AuthenticatedUser(licenseKey: string, username: string, publicKey: string, encryptedPrivateKey: string): Promise<string | null> {

    try {
      // Try to find the user
      const user = await User.findOneOrFail({
        where: {
          licenseKey: licenseKey,
        },
      });

      user.activeSessionToken = undefined;
      // Generate a new session token
      const newSessionToken = this.generateSessionToken();

      user.activeSessionToken = newSessionToken;
      user.username = username;
      user.publicKey = publicKey;
      user.encryptedPrivateKey = encryptedPrivateKey;

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