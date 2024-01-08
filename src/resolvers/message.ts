import { GeneralResponse } from "../responses/General/GeneralResponse";
import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Context } from "../types";
import MessagingService from "../services/MessagingService";
import { AuthMiddleware } from "../middleware/Authentication";
import { Chat } from "../entities/Chat";

@Resolver()
export class MessageResolver {
    @Mutation(() => String)
    async messageHealthCheck(): Promise<String> {
        return "OK"
    }

    @Mutation(() => GeneralResponse)
    @UseMiddleware(AuthMiddleware)
    async sendMessage(
        @Arg("toUserId") toUserId: string,
        @Arg("content") content: string,
        @Ctx() { req, userId}: Context
    ): Promise<GeneralResponse> {
        try {
            const existingChat = await MessagingService.existingChat(userId!, toUserId);

            if (existingChat) {
                await MessagingService.sendMessage(userId!, toUserId, content);
            } else {
                await MessagingService.createChat(userId!, toUserId);
                await MessagingService.sendMessage(userId!, toUserId, content);
            }
            return {
                success: true,
            };
        } catch (error) {
            console.error("Error sending message:", error);
            return {
                error: { field: "Error", message: "Something went wrong" },
            };
            
        }
        
        
    }

    @Query(() => [Chat])
    @UseMiddleware(AuthMiddleware)
    async chats(
        @Ctx() { req, userId}: Context
    ): Promise<Chat[]> {
        try {
            const chats = await MessagingService.getChats(userId!);
            console.log("chats", chats);
            return chats;
        } catch (error) {
            console.error("Error getting chats:", error);
            throw error;
        }
    }


    @Query(() => Chat)
    @UseMiddleware(AuthMiddleware)
    async chat(
        @Arg("id") id: string,
        @Ctx() { userId}: Context
    ): Promise<Chat | null> {
        try {
            const chat = await MessagingService.getChat(userId!,id!);
            return chat;
        } catch (error) {
            console.error("Error getting chats:", error);
            throw error;
        }
    }
}