import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field, UseMiddleware } from 'type-graphql'
import UserService from '../services/UserService';
import { GeneralResponse } from '../responses/General/GeneralResponse';
import { VerificationSMSSenderLimiter } from '../services/RateLimiter';
import { Context } from '../types';
import AuthService from '../services/AuthService';
import { SignUpState } from '../enums/SignUpState';
import { TokenResponse } from '../responses/TokenResponse';
import SMSService from '../services/SMSService';
import { User } from '../entities/User';
import { FieldError } from '../responses/General/FieldError';
import { AuthResponse } from '../responses/AuthResponse';
import { AuthMiddleware } from '../middleware/Authentication';


@Resolver()
export class UserResolver {
    @Query(() => String)
    async userhealthCheck(): Promise<string> {
        return "OK";
    }

    @Mutation(() => TokenResponse)
    async sendVerificationCode(
        @Arg("countryCode") countryCode: string,
        @Arg("phoneNumber") phoneNumber: string,
        @Ctx() { req }: Context
    ): Promise<TokenResponse> {
        // Limiter for spam protection
        // try {
        //     await VerificationSMSSenderLimiter.consume(req.ip);
        // } catch (error) {
        //     return {
        //         error: { field: "content", message: "You requested too many verification codes, please try again in one hour" },
        //     };
        // }
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
        @Arg("code") code: string,
        @Arg("registrationToken") registrationToken: string,
        @Ctx() { req }: Context
    ): Promise<TokenResponse> {
        // Limiter for spam protection
        // try {
        //     await VerificationSMSSenderLimiter.consume(req.ip);
        // } catch (error) {
        //     return {
        //         error: { field: "Error", message: "You tried too many times, please try again later" },
        //     };
        // }
        
        const payload = AuthService.getPayloadbyToken(registrationToken);

        if (!payload) {
            return {
                error: { field: "Error", message: "Invalid or expired registration token" },
            };
        }


        const valid = AuthService.validateRegistrationToken(registrationToken, payload.countryCode, payload.phoneNumber);

        if (!valid) {
            return {
                error: { field: "Registration Token", message: "Invalid or expired registration token" },
            };
        }

        const response = await UserService.validateVerificationCode(payload.countryCode, payload.phoneNumber, code);

        if (response.success) {
            const token = AuthService.updateStateForToken(registrationToken, SignUpState.PHONE_NUMBER_VERIFIED)
            if (token) {
                return {
                    token
                }
            }
        }
        if (response.error) return {
            error: { field: response.error.field, message: response.error.message },
        };

        return {
            error: { field: "Error", message: "Something went wrong, try again later" },
        };
    }

    @Mutation(() => AuthResponse)
    async authenticate(
        @Arg("username") username: string,
        @Arg("registrationToken") registrationToken: string,
        @Arg("publicKey") publicKey: string,
    ): Promise<AuthResponse> {
        try {
            const payload = AuthService.getPayloadbyToken(registrationToken);
    
            if (payload?.registrationState == SignUpState.PHONE_NUMBER_VERIFIED) {
    
                const sessionToken = await AuthService.AuthenticatedUser(payload.countryCode, payload.phoneNumber, username, publicKey);
                if (sessionToken) {
                    return { sessionToken: sessionToken };
                }
            }
            else if (payload?.registrationState == SignUpState.PHONE_NUMBER_PROVIDED) {
                return {
                    error: { field: "Error", message: "Phone number was not verified" }
                }
            }
    
            return {
                error: { field: "Error", message: "Invalid or expired registration token" }
            }
        } catch (error) {
            console.error("Error authenticating user", error);
            return {
                error: { field: "Error", message: "Something went wrong, try again later" }
            }
        }
        

    }

    
    @Query(() => User, { nullable: true })
    @UseMiddleware(AuthMiddleware)
    async user(
        @Ctx() {userId}: Context
    ): Promise<User | null> {
        const user = await UserService.getUserById(userId!);
        return user;
    }


    //TODOD: remove this
    @Query(() => [User],{ nullable: true })
    @UseMiddleware(AuthMiddleware)
    async users(@Ctx() {userId}: Context): Promise<User[]> {
        const users = await UserService.getAllUsers(userId!);
        return users;
    }
}