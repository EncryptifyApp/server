require('dotenv').config()
import jwt from 'jsonwebtoken';
import { SignUpState } from '../enums/SignUpState';
import { RegistrationPayload } from 'src/types';
import { User } from '../entities/User';
import crypto, { randomUUID } from 'crypto';
const secretKey = process.env.JWT_SECRET || "JWT_FALLBACK_SECRET_KEY";

class AuthService {
  generateToken(countryCode: string, phoneNumber: string): string {
    const expiresIn = '1h';
    const payload: RegistrationPayload = {
      countryCode,
      phoneNumber,
      registrationState: SignUpState.PHONE_NUMBER_PROVIDED,
    };
    return jwt.sign(payload, secretKey, { expiresIn })
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      console.error("Error verifying token", error);
      return null;
    }
  }

  getPayloadbyToken(token: string): RegistrationPayload | null {
    const payload = this.verifyToken(token);
    if (payload) return payload as RegistrationPayload;

    return null;
  }

  updateStateForToken(token: string, newRegistrationState: SignUpState): string | null {
    const payload = this.verifyToken(token);

    if (payload) {
      payload.registrationState = newRegistrationState;
      try {
        return jwt.sign(payload, secretKey);
      } catch (err) {
        console.error("Error updating token", err);
        return null;
      }
    }
    return null
  }


  validateRegistrationToken(token: string, countryCode: string, phoneNumber: string): boolean {
    try {
      const payload = jwt.verify(token, secretKey) as { countryCode: string; phoneNumber: string };
      return payload.countryCode === countryCode && payload.phoneNumber === phoneNumber;
    } catch (error) {
      return false;
    }
  }

  generateSessionToken(): string {
    const token = crypto.randomBytes(32).toString("hex");
    return token;
  }

  async AuthenticatedUser(countryCode: string, phoneNumber: string, username: string,publicKey:string): Promise<string | null> {
    let user: User;

    try {
        // Try to find the user
        user = await User.findOneOrFail({
            where: {
                countryCode: countryCode,
                phoneNumber: phoneNumber
            },
        });

        // If the user exists, invalidate the existing session
        if (user.activeSessionToken) {
            user.activeSessionToken = undefined;
            await user.save();
        }
    } catch (error) {
        // If the user doesn't exist, create a new one
        if (error.name === "EntityNotFoundError") {
            user = await User.create({
                id: randomUUID(),
                username: username,
                countryCode: countryCode,
                phoneNumber: phoneNumber,
                publicKey: publicKey
            }).save();
        } else {
            // Handle other errors if needed
            console.error(error);
            return null;
        }
    }

    // Generate a new session token
    const newSessionToken = this.generateSessionToken();
    user.activeSessionToken = newSessionToken;
    user.username = username;
    user.publicKey = publicKey;
    await user.save();

    // Return the new session token
    return newSessionToken;
}


}


export default new AuthService();