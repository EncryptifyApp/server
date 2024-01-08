import { Chat } from "../entities/Chat";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { In } from "typeorm";


class MessagingService {

    async existingChat(fromUserId: string, toUserId: string): Promise<boolean> {
        const chat = await Chat.createQueryBuilder('chat')
          .innerJoin('chat.members', 'participant')
          .where('participant.id IN (:...ids)', { ids: [fromUserId, toUserId] })
          .groupBy('chat.id')
          .having('COUNT(DISTINCT participant.id) = :count', { count: 2 })
          .getOne();
      
        console.log("chat exists", !!chat);
        return !!chat;
      }

    async createChat(fromUserId: string, toUserId: string): Promise<Chat> {
        // Fetch User entities based on user IDs
        const fromUser = await User.findOne({where:{id:fromUserId}});
        const toUser = await User.findOne({where:{id:toUserId}});

        // Create a new Chat instance
        const chat = new Chat();

        // Assign Users to the participants property
        chat.members = [fromUser!, toUser!];

        // Save the chat to the database
        await chat.save();
        console.log("first time: chat created", chat);
        return chat;
    }


    async sendMessage(fromUserId: string, toUserId: string, content: string): Promise<Message> {
        console.log("sending message");
        // Fetch User entities based on user IDs
        const fromUser = await User.findOne({ where: { id: fromUserId } });
        const toUser = await User.findOne({ where: { id: toUserId } });
      
        console.log("from user", fromUser?.username);
        console.log("to user", toUser?.username);
      
        // Find or create a chat
        let chat = await Chat.createQueryBuilder('chat')
          .innerJoin('chat.members', 'participant')
          .where('participant.id IN (:...ids)', { ids: [fromUserId, toUserId] })
          .groupBy('chat.id')
          .having('COUNT(DISTINCT participant.id) = :count', { count: 2 })
          .getOne();
      
        if (!chat) {
          // If chat doesn't exist, create a new one
          chat = new Chat();
          chat.members = [fromUser!, toUser!];
          await chat.save();
        }
    
        await chat.save();

        // Create a new Message instance
        const message = new Message();
      
        // Assign Users to the sender and receiver properties
        message.sender = fromUser!;
        message.receiver = toUser!;
      
        // Assign the message content
        message.content = content;
        message.chat = chat;
      
        // Save the message to the database
        await message.save();
      
        console.log("message sent", message);
        return message;
      }


      async getChats(userId: string): Promise<Chat[]> {
        const chats = await Chat.createQueryBuilder('chat')
          .innerJoin('chat.members', 'member')
          //messages
          .leftJoinAndSelect('chat.messages', 'message')
          .leftJoinAndSelect('message.sender', 'sender')
          .where('member.id = :id', { id: userId })
          //select just the memebers that are not the current user
        
          .select([
            //chat
            'chat.id',
            'chat.updatedAt', 
            //members
            'member.id', 
            'member.username', 
            //messages
            'message.id', 
            'message.content', 
            'message.createdAt', 
            //sender
            'sender.username', 
            'sender.profileUrl'
          ])
          .getMany()
      
        return chats;
      }
      
      async getChat(AuthUserId:string,userId: string): Promise<Chat | null> {
          //get chat the includes both users
        const chat = await Chat.createQueryBuilder('chat')
          .innerJoin('chat.members', 'member')
          //messages
          .leftJoinAndSelect('chat.messages', 'message')
          .leftJoinAndSelect('message.sender', 'sender')
          .where('member.id IN (:...ids)', { ids: [AuthUserId, userId] }) 
          .select([
            //chat
            'chat.id',
            //members
            'member.id', 
            'member.username', 
            //messages
            'message.id', 
            'message.content', 
            'message.createdAt', 
            //sender
            'sender.id',
            'sender.username', 
            'sender.profileUrl'
          ])
          .getOne()

          return chat;
      }

}

export default new MessagingService();