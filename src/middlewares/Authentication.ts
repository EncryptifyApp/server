// authMiddleware.ts
import { User } from "../entities/User";
import { Context } from "../types";
import { MiddlewareFn } from "type-graphql";

export const AuthMiddleware: MiddlewareFn<Context> = async ({ context }, next) => {
    try {
        
        if (!context.req || !context.req.headers) {
            throw new Error("Request or headers missing");
        }
        const sessionToken = context.req.headers["authorization"];
        if (!sessionToken) {
            throw new Error("Authorization token missing");
        }

        // Find the user based on the active session token
        const user = await User.findOne({ where: { activeSessionToken: sessionToken } });
        if (!user || !sessionToken) {
            context.userId = null;
            throw new Error("Not Authenticated");
        }

        // Attach the user to the context for use in the resolver
        context.userId = user.id;
    } catch (error) {
        console.error(error);
        return new Error("Error: " + error);
    }

    return next();
};
