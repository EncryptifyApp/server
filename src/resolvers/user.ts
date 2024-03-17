import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field, UseMiddleware } from 'type-graphql'
import UserService from '../services/UserService';
import { RateLimiter } from '../services/RateLimiter';
import { Context } from '../types';
import AuthService from '../services/AuthService';
import { User } from '../entities/User';
import { AuthResponse } from '../responses/AuthResponse';
import { AuthMiddleware } from '../middlewares/Authentication';
import { UserResponse } from '../responses/General/UserResponse';
import { Chat } from '../entities/Chat';


@Resolver()
export class UserResolver {
    @Query(() => String)
    async userhealthCheck(): Promise<string> {
        return "OK";
    }

    @Query(() => UserResponse)
    async findAccount(
        @Arg("accountNumber") accountNumber: string,
        @Ctx() { req }: Context
    ): Promise<UserResponse> {
        // Limiter for spam protection
        // try {
        //     await RateLimiter.consume(req.ip);
        // } catch (error) {
        //     return {
        //         error: { field: "Error", message: "You tried too many times, please try again later" },
        //     };
        // }
        try {
            const user = await UserService.getUserByAccountNumber(accountNumber);

            if(user) {
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
        @Arg("accountNumber") accountNumber: string,
        @Arg("username") username: string,
        @Arg("publicKey") publicKey: string,
        @Arg("encryptedPrivateKey") encryptedPrivateKey: string,
        @Ctx() { res }: Context
    ): Promise<AuthResponse> {
        try {
            const sessionToken = await AuthService.AuthenticatedUser(accountNumber, username, publicKey, encryptedPrivateKey);

            if(sessionToken) {
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


    @Query(() => User, { nullable: true })
    @UseMiddleware(AuthMiddleware)
    async authenticatedUser(
        @Ctx() { userId }: Context
    ): Promise<User | null> {
        const user = await UserService.getUserById(userId!);
        return user;
    }


}