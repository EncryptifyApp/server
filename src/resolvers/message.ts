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
          const message = await Message.findOne({where: {id: payload.id}, relations: {
            chat: {
              members: true
            }
          }});
      
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
            chat: messagePayload.chat,
            createdAt: messagePayload.createdAt,
        }
      }
      

    @Query(() => String)
    async messageHealthCheck(): Promise<String> {
        return "OK"
    }

    @Mutation(() => Message)
    @UseMiddleware(AuthMiddleware)
    async sendMessage(
        @Arg("toUserId") toUserId: string,
        @Arg("content") content: string,
        @PubSub("NEW_MESSAGE") publishNewMessage: Publisher<Message>,
        @Ctx() { req, userId }: Context
    ): Promise<Message | null> {
        try {
            const existingChat = await MessagingService.existingChat(userId!, toUserId);

            if (existingChat) {
                const message = await MessagingService.sendMessage(userId!, toUserId, content);
                await publishNewMessage(message);
                return message;
            } else {
                await MessagingService.createChat(userId!, toUserId);
                const message = await MessagingService.sendMessage(userId!, toUserId, content);
                await publishNewMessage(message);
                return message;
            }
            
            
        } catch (error) {
            console.error("Error sending message:", error);
            return null
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
}