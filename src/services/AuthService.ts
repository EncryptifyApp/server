require('dotenv').config()

import { User } from '../entities/User';
import crypto, { randomUUID } from 'crypto';
const secretKey = process.env.JWT_SECRET || "JWT_FALLBACK_SECRET_KEY";

class AuthService {



  generateSessionToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    return token;
  }

  async AuthenticatedUser(accountNumber: string, username: string, publicKey: string, encryptedPrivateKey: string): Promise<string | null> {

    try {
      // Try to find the user
      const user = await User.findOneOrFail({
        where: {
          accountNumber: accountNumber,
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