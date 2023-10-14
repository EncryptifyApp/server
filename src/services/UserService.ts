import { User } from "../entities/User";
import { GeneralResponse } from "../resolvers/Responses/General/GeneralResponse";
import { VerificationCode } from "../entities/VerificationCode";
import { LessThanOrEqual } from 'typeorm';
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { SignUpResponse } from "src/resolvers/Responses/SignUpResponse";


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


    async signUp(countryCode: string, phoneNumber: string, username: string, deviceId: string): Promise<SignUpResponse> {
        try {
            const user = await User.create({
                id: randomUUID(),
                username: username,

                countryCode: countryCode,
                phoneNumber: phoneNumber,
                deviceId: deviceId
            }).save();

            return { user: user };
        } catch (err) {
            return { error: { field: "An error has occured", message: err.message } }
        }

    }

    async validateVerificationCode(countryCode: string, phoneNumber: string, code: string): Promise<GeneralResponse> {
        try {
            const validCode = await VerificationCode.createQueryBuilder().where({
                code: code,
                countryCode: countryCode,
                phoneNumber: phoneNumber,
                expiresAt: LessThanOrEqual(new Date()),
            })
                .getOne();

            if (validCode) {
                //AUTHENTICATE DEVICE HERE WITH JWT

                return { success: true }
            }
            else {
                return { error: { field: "Not valid", message: "The code you provided is not valid" } }
            }
        } catch (err) {
            return { error: { field: "Error", message: err.message || "An error has occured" } }
        }
    }
}

export default new UserService();
