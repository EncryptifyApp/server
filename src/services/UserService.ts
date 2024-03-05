import { User } from "../entities/User";
import { GeneralResponse } from "../responses/General/GeneralResponse";
import { Not } from "typeorm";


class UserService {
    async getUserById(id: string): Promise<User | null> {
        try {
            const user = await User.findOneBy({ id });
            return user;
        } catch (error) {
            console.error("Error fetching user by ID:", error);
            throw error;
        }
    }

    async getUserByAccountNumber(accountNumber: string): Promise<User | null> {
        try {
            const user = await User.findOne({
                where: {
                    accountNumber: accountNumber,
                },
            });

            return user;
        } catch (error) {
            console.error("Error fetching user", error);
            throw error;
        }
    }
}

export default new UserService();