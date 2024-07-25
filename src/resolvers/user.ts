import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field, UseMiddleware } from 'type-graphql'
import UserService from '../services/UserService';
import { RateLimiter } from '../services/RateLimiter';
import { Context } from '../types';
import AuthService from '../services/AuthService';
import { AuthResponse } from '../responses/AuthResponse';
import { AuthMiddleware } from '../middlewares/Authentication';
import { AuthenticationUserResponse } from '../responses/General/AuthenticationUserResponse';
import { GeneralResponse } from '../responses/General/GeneralResponse';


@Resolver()
export class UserResolver {
    @Query(() => String)
    async userhealthCheck(): Promise<string> {
        return "OK";
    }

    @Query(() => AuthenticationUserResponse)
    async findAccount(
        @Arg("licenseKey") licenseKey: string,
        @Ctx() { req }: Context
    ): Promise<AuthenticationUserResponse> {
        // Limiter for spam protection
        // try {
        //     await RateLimiter.consume(req.ip);
        // } catch (error) {
        //     return {
        //         error: { field: "Error", message: "You tried too many times, please try again later" },
        //     };
        // }
        try {
            const user = await UserService.getUserByLicenseKey(licenseKey);

            if (user) {
                return {
                    user: user
                }
            }

            return {
                error: { field: "Not Found", message: "Account not found" }
            }
        } catch (error) {
            console.error("Error authenticating user", error);
            return {
                error: { field: "Error", message: "Something went wrong, try again later" }
            }
        }
    }


    @Mutation(() => AuthResponse)
    async authenticate(
        @Arg("licenseKey") licenseKey: string,
        @Arg("username") username: string,
        @Arg("publicKey") publicKey: string,
        @Arg("encryptedPrivateKey") encryptedPrivateKey: string,
        @Ctx() { res }: Context
    ): Promise<AuthResponse> {
        try {
            const sessionToken = await AuthService.AuthenticatedUser(licenseKey, username, publicKey, encryptedPrivateKey);

            if (sessionToken) {
                return {
                    sessionToken: sessionToken
                }
            }
            return {
                error: { field: "Error", message: "Something went wrong, try again later" }
            }
        } catch (error) {
            console.error("Error authenticating user", error);
            return {
                error: { field: "Error", message: "Something went wrong, try again later" }
            }
        }
    }


    @Query(() => AuthenticationUserResponse, { nullable: true })
    @UseMiddleware(AuthMiddleware)
    async authenticatedUser(
        @Ctx() { userId }: Context
    ): Promise<AuthenticationUserResponse | null> {
        const user = await UserService.getUserById(userId!);
        if(!user) {
            return {
                error: { field: "Not Found", message: "User not found" }
            };
        }
        const subscriptionEndDate = await UserService.getSubscriptionEndDate(userId!);
        
        return {
            user: user,
            subscriptionEndDate:subscriptionEndDate!
        };
    }


    @Mutation(() => GeneralResponse)
    @UseMiddleware(AuthMiddleware)
    async updateUserExpoPushToken(
        @Arg('userId') userId: string,
        @Arg('expoPushToken') expoPushToken: string
    ): Promise<GeneralResponse> {
        const updated = await UserService.updateUserExpoPushToken(userId, expoPushToken);
        if(updated) {
            return {
                success: true
            }
        } else {
            return {
                error: { field: "Error", message: "Something went wrong, try again later" }
            }
        }
    }
}