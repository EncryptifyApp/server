import { User } from "../entities/User";
import { GeneralResponse } from "../responses/General/GeneralResponse";
import { Not } from "typeorm";


class UserService {

    //TODO: remove this
    async getAllUsers(id: string): Promise<User[]> {
        try {
            const users = await User.find({
                where: {
                    id: Not(id),
                },
            });
            return users;
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

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