import { User } from "../entities/User";
import { Subscription } from "../entities/Subscription";
import { Chat } from "../entities/Chat";
import { faker } from '@faker-js/faker';
import UserService  from "../services/UserService";
export const userSeeder = async (number: number) => {
    for (let i = 0; i < number; i++) {
        const user = User.create({
            licenseKey: UserService.generateLicenseKey(),
        });
        await user.save();

        const subscription = Subscription.create({
            startDate: faker.date.past(),
            endDate: faker.date.future(),
        });
        subscription.user = user;


        console.log(`${i + 1} : `, user.licenseKey);

        await subscription.save();
    }
}