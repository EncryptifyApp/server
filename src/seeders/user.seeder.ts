import { User } from "../entities/User";
import { Subscription } from "../entities/Subscription";
import { Chat } from "../entities/Chat";
import { faker } from '@faker-js/faker';

export const userSeeder = async (number: number) => {
    for (let i = 0; i < number; i++) {
        const user = User.create({
            profileUrl: faker.image.avatar(),
            accountNumber: faker.string.numeric(12),
        });
        await user.save();

        const subscription = Subscription.create({
            startDate: faker.date.past(),
            endDate: faker.date.future(),
        });
        subscription.user = user;

        await subscription.save();

        // Create a chat between the current user and another random user
        const randomUserId = await User.createQueryBuilder()
            .where("id != :userId", { userId: user.id })
            .getOne();

        if (randomUserId) {
            await createChatWithoutMessages(user.id, randomUserId.id);
        }
    }
}

async function createChatWithoutMessages(fromUserId: string, toUserId: string): Promise<Chat> {
    // Fetch User entities based on user IDs
    const fromUser = await User.findOne({ where: { id: fromUserId } });
    const toUser = await User.findOne({ where: { id: toUserId } });

    // Create a new Chat instance
    const chat = new Chat();

    // Assign Users to the participants property
    chat.members = [fromUser!, toUser!];

    // Save the chat to the database
    await chat.save();

    return chat;
}
