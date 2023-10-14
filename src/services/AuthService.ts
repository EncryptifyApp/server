require('dotenv').config()
import jwt from 'jsonwebtoken';
import { SignUpState } from '../enums/SignUpState';

const secretKey = process.env.JWT_SECRET || "JWT_FALLBACK_SECRET_KEY";

class AuthService {
  generateToken(countryCode: string, phoneNumber: string): string {
    const expiresIn = '1h';
    const registrationState = SignUpState.PhoneNumberProvided;
    const payload = {
      countryCode,
      phoneNumber,
      registrationState
    };
    return jwt.sign(payload, secretKey, { expiresIn })
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      return null;
    }
  }

  getStateForToken(token: string): SignUpState | null {
    const payload = this.verifyToken(token);
    if (payload && payload.registrationState) {
      return payload.registrationState as SignUpState;
    }
    return null;
  }

  updateStateForToken(token: string, newRegistrationState: SignUpState): String | null {
    const payload = this.verifyToken(token);
    
    if (payload) {
      payload.registrationState = newRegistrationState;
      try {
        return jwt.sign(payload, secretKey);
      } catch (err) {
        console.log("Error updating token", err);
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
}


export default new AuthService();