import { User } from "../entities/User";
import { GeneralResponse } from "../responses/General/GeneralResponse";
import { VerificationCode } from "../entities/VerificationCode";
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

    async getUserByPhoneNumber(countryCode: string, phoneNumber: string): Promise<User | null> {
        try {
            const user = await User.findOne({
                where: {
                    countryCode: countryCode,
                    phoneNumber: phoneNumber
                },
            });

            return user;
        } catch (error) {
            console.error("Error fetching user", error);
            throw error;
        }
    }


    async validateVerificationCode(countryCode: string, phoneNumber: string, code: string): Promise<GeneralResponse> {
        const validCode = await VerificationCode.findOne({
            where: {
                code: code,
                countryCode: countryCode,
                phoneNumber: phoneNumber,
            }
        });

        if (validCode) {
            return { success: true };
        } else {
            return { error: { field: "Code", message: "Invalid code" } };
        }

    }
}

export default new UserService();