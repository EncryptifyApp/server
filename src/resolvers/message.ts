import { GeneralResponse } from "../responses/General/GeneralResponse";
import { Arg, Ctx, Mutation, PubSub, Publisher, Query, Resolver, Root, Subscription, UseMiddleware } from "type-graphql";
import { Context } from "../types";
import MessagingService from "../services/MessagingService";
import { AuthMiddleware } from "../middlewares/Authentication";
import { Chat } from "../entities/Chat";
import { Message } from "../entities/Message";
import { User } from "../entities/User";

@Resolver()
export class MessageResolver {

    @Subscription({
        topics: "NEW_MESSAGE",
        filter: async ({ payload, context }) => {
          const message = await Message.findOne({where: {id: payload.id}, relations: ["chat", "chat.members"]});
      
          if (!message) {
            return false;
          }
        
          return message.chat!.members.some((member) => member.activeSessionToken?.includes(context));
        },
      })
      newMessage(@Root() messagePayload: Message): Message {
        //@ts-ignore
        return {
            id: messagePayload.id,
            content: messagePayload.content,
            sender: messagePayload.sender,
            createdAt: messagePayload.createdAt,
        }
      }
      

    @Query(() => String)
    async messageHealthCheck(): Promise<String> {
        return "OK"
    }

    @Mutation(() => GeneralResponse)
    @UseMiddleware(AuthMiddleware)
    async sendMessage(
        @Arg("toUserId") toUserId: string,
        @Arg("content") content: string,
        @PubSub("NEW_MESSAGE") publishNewMessage: Publisher<Message>,
        @Ctx() { req, userId }: Context
    ): Promise<GeneralResponse> {
        try {
            const existingChat = await MessagingService.existingChat(userId!, toUserId);

            if (existingChat) {
                const message = await MessagingService.sendMessage(userId!, toUserId, content);
                await publishNewMessage(message);
            } else {
                await MessagingService.createChat(userId!, toUserId);
                const message = await MessagingService.sendMessage(userId!, toUserId, content);
                await publishNewMessage(message);
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
        @Ctx() { req, userId }: Context
    ): Promise<Chat[]> {
        try {
            const chats = await MessagingService.getChats(userId!);
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
    ): Promise<Chat | null> {
        try {
            const chat = await MessagingService.getChat(id);
            return chat;
        } catch (error) {
            console.error("Error getting chats:", error);
            throw error;
        }
    }
}