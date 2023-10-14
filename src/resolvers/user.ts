import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql'
import UserService from '../services/UserService';
import { GeneralResponse } from './Responses/General/GeneralResponse';
import { VerificationSMSSenderLimiter } from '../services/RateLimiter';
import { Context } from '../types';
import AuthService from '../services/AuthService';
import { SignUpState } from '../enums/SignUpState';
import { TokenResponse } from './Responses/TokenResponse';
import SMSService from '../services/SMSService';
import { SignUpResponse } from './Responses/SignUpResponse';


@Resolver()
export class UserResolver {
    @Query(() => String)
    async hello(): Promise<string> {
        return "Hello world"
    }

    @Mutation(() => TokenResponse)
    async sendVerificationCode(
        @Arg("countryCode") countryCode: string,
        @Arg("phoneNumber") phoneNumber: string,
        @Ctx() { req }: Context
    ): Promise<TokenResponse> {
        // Limiter for spam protection
        try {
            await VerificationSMSSenderLimiter.consume(req.ip);
        } catch (error) {
            return {
                error: { field: "content", message: "You requested too many verification codes, please try again in one hour" },
            };
        }

        const res = await SMSService.sendVerificationCode(countryCode, phoneNumber);

        if (res.error) {
            return {
                error: { field: res.error.field, message: res.error.message },
            };
        }

        const registrationToken = AuthService.generateToken(countryCode, phoneNumber);
        return {
            token: registrationToken
        }
    }

    @Mutation(() => TokenResponse)
    async validateVerificationCode(
        @Arg("countryCode") countryCode: string,
        @Arg("phoneNumber") phoneNumber: string,
        @Arg("code") code: string,
        @Arg("registrationToken") registrationToken: string,
        @Ctx() { req }: Context
    ): Promise<TokenResponse> {
        // Limiter for spam protection
        try {
            await VerificationSMSSenderLimiter.consume(req.ip);
        } catch (error) {
            return {
                error: { field: "Error", message: "You tried too many times, please try again later" },
            };
        }

        if (!AuthService.validateRegistrationToken(registrationToken, countryCode, phoneNumber)) {
            return {
                error: { field: "Registration Token", message: "Invalid or expired registration token" },
            };
        }

        const response = await UserService.validateVerificationCode(countryCode, phoneNumber, code);

        if (response.success) {
            const token = AuthService.updateStateForToken(registrationToken, SignUpState.SMSCodeValidated)
            if (token) return { token: token }
        }

        if (response.error) return {
            error: { field: response.error.field, message: response.error.message },
        };

        return {
            error: { field: "Error", message: "Something went wrong, try again later" },
        };
    }

    @Mutation(() => SignUpResponse)
    async signUp(
        @Arg("countryCode") countryCode: string,
        @Arg("phoneNumber") phoneNumber: string,
        @Arg("Username") username: string,
        @Arg("deviceId") deviceId: string,
        @Arg("registrationToken") registrationToken: string,
    ): Promise<SignUpResponse> {
        const state = AuthService.getStateForToken(registrationToken);
        if (state == SignUpState.SMSCodeValidated) {
            return await UserService.signUp(countryCode, phoneNumber, username, deviceId)
        } else {
            return {
                error: { field: "Error", message: "Phone number was not verifieds" }
            }
        }

    }
}