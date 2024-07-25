import { MessageStatus } from "../enums/MessageStatus";
import { Chat } from "../entities/Chat";
import { Message } from "../entities/Message";
import { User } from "../entities/User";


class MessagingService {

  async existingChat(fromUserId: string, toUserId: string): Promise<boolean> {
    const chat = await Chat.createQueryBuilder('chat')
      .innerJoin('chat.members', 'participant')
      .where('participant.id IN (:...ids)', { ids: [fromUserId, toUserId] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT participant.id) = :count', { count: 2 })
      .getOne();

    return !!chat;
  }

  async createChat(fromUserId: string, toUserId: string): Promise<Chat> {
    // Fetch User entities based on user IDs
    const fromUser = await User.findOne({ where: { id: fromUserId } });
    const toUser = await User.findOne({ where: { id: toUserId } });

    // Create a new Chat instance
    const chat = new Chat();

    // Assign Users to the participants property
    chat.members = [fromUser!, toUser!];

    //initialize list of messages
    chat.messages = [];
    // Save the chat to the database
    await chat.save();

    return chat;
  }


  async sendMessage(fromUserId: string, toUserId: string, content: string): Promise<Message> {
    
    // Fetch User entities based on user IDs
    const fromUser = await User.findOne({ where: { id: fromUserId } });
    const toUser = await User.findOne({ where: { id: toUserId } });

    // Find or create a chat
    let chat = await Chat.createQueryBuilder('chat')
      .innerJoin('chat.members', 'participant')
      .where('participant.id IN (:...ids)', { ids: [fromUserId, toUserId] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT participant.id) = :count', { count: 2 })
      .getOne();

    if (!chat) {
      chat = new Chat();
      chat.members = [fromUser!, toUser!];
      await chat.save();
    }

    // Create a new Message instance
    const message = new Message();

    // Assign Message status
    message.status = MessageStatus.SENT;

    // Assign Users to the sender and receiver properties
    message.sender = fromUser!;

    // Assign the message content
    message.content = content;
    message.chat = chat;
    message.chat.members = [fromUser!, toUser!];
    
    // Save the message to the database
    await message.save();

    return message;
  }

  async sendPendingMessage(fromUserId: string, chatId: string, content: string) : Promise<Message> {
    const fromUser = await User.findOne({ where: { id: fromUserId } });
    const chat = await Chat.findOne({ where: { id: chatId } });
    const message = new Message();
    message.status = MessageStatus.SENT;
    message.sender = fromUser!;
    message.content = content;
    message.chat = chat!;
    await message.save();
    return message;
  }

  async getChats(userId: string): Promise<Chat[]> {
    const chats = await Chat.createQueryBuilder("chat")
      .innerJoinAndSelect("chat.members", "member")
      .leftJoinAndSelect("chat.messages", "message")
      .leftJoinAndSelect("message.sender", "sender")
      .addSelect([
        // members
        "member.id",
        "member.username",
        "member.profileUrl",
        "member.publicKey",
        // messages
        "message.content",
        "message.createdAt",
        "message.id",
        // sender
        "sender.id",
        "sender.username",
        "sender.profileUrl",
      ])
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("1")
          .from("chat_members_user", "cm")
          .where("cm.chatId = chat.id")
          .andWhere("cm.userId = :userId")
          .getQuery();

        return `EXISTS ${subQuery}`;
      })
      .setParameter("userId", userId)
      .getMany();

    return chats;
  }

  async getChatById(chatId: string): Promise<Chat | null> {
    return await Chat.createQueryBuilder("chat")
      .innerJoinAndSelect("chat.members", "member")
      .leftJoinAndSelect("chat.messages", "message")
      .leftJoinAndSelect("message.sender", "sender")
      .addSelect([
        // members
        "member.id",
        "member.username",
        "member.profileUrl",
        "member.publicKey",
        // messages
        "message.content",
        "message.createdAt",
        "message.id",
        // sender
        "sender.id",
        "sender.username",
        "sender.profileUrl",
      ])
      .where("chat.id = :chatId", { chatId })
      .getOne();
  }

  async getChatByUserId(fromUserId: string, toUserId: string): Promise<Chat | null> {
    const toUser = await User.findOne({ where: { id:toUserId } });
    const chat = await Chat.createQueryBuilder('chat')
      .innerJoin('chat.members', 'participant')
      .where('participant.id IN (:...ids)', { ids: [fromUserId, toUser?.id] })
      .groupBy('chat.id')
      .having('COUNT(DISTINCT participant.id) = :count', { count: 2 })
      .getOne();

    if (chat) {
      return chat;
    } else {
      const chat = this.createChat(fromUserId, toUser!.id);
      return chat;
    }
  }

  //mark messages as read
  async markMessagesAsRead(userId: string, messageIds: string[]): Promise<boolean> {
    const user = await User.findOne({ where: { id: userId } });
    try {
      const messages
        = await Message.createQueryBuilder('message')
          .innerJoin('message.chat', 'chat')
          .innerJoin('chat.members', 'member')
          .where('member.id = :userId', { userId })
          .andWhere('message.id IN (:...messageIds)', { messageIds })
          .getMany();

      messages.forEach(async (message) => {
        message.seenBy = [...message.seenBy, user!];
        await message.save();
      }
      );

      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }

  //mark messages as delivered
  async markMessagesAsDelivered(userId: string, messageIds: string[]): Promise<boolean> {
    const
      user = await User.findOne({ where: { id: userId } });
    try {
      const messages = await Message.createQueryBuilder('message')
        .innerJoin('message.chat', 'chat')
        .innerJoin('chat.members', 'member')
        .where('member.id = :userId', { userId })
        .andWhere('message.id IN (:...messageIds)', { messageIds })
        .getMany();

      messages.forEach(async (message) => {
        message.deliveredTo = [...message.deliveredTo, user!];
        await message.save();
      }
      );

      return true;
    }
    catch (error) {
      console.error(error);
      return false;
    }
  }
}


export default new MessagingService();