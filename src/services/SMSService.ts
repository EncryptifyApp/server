require('dotenv').config()
import { MoreThanOrEqual } from "typeorm";
import { VerificationCode } from "../entities/VerificationCode";
import { GeneralResponse } from "../responses/General/GeneralResponse";
import Twilio from 'twilio';

//TWILIO credentials
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);


class SMSService {

    generateVerificationCode(): string {
        const min = 100000; // Minimum 6-digit number
        const max = 999999; // Maximum 6-digit number
        const code = Math.floor(Math.random() * (max - min + 1)) + min;

        return code.toString();
    }
    

    async sendVerificationCode(countryCode: string, phoneNumber: string): Promise<GeneralResponse> {
        const existingCode = await VerificationCode.createQueryBuilder().where({
            countryCode: countryCode,
            phoneNumber: phoneNumber,
            expiresAt: MoreThanOrEqual(new Date()),
          })
          .getOne();
        if (existingCode) {
            return {
                error: { field: "Existing Code", message: "You have to wait 1 minute before you can send another verification code" },
            };
        }


        const code = this.generateVerificationCode();
        // Set the expiry date 1 minute in the future
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 1);

        try {
            await VerificationCode.create({
                countryCode: countryCode,
                phoneNumber: phoneNumber,
                code: code,
                expiresAt: expirationDate,
            }).save();
            //Send SMS
            // await client.messages.create({
            //     from: "+1 561 571 8389",
            //     to: countryCode + phoneNumber,
            //     body: `Your Encryptify Verification code is: ${code}`,
            // });
            console.log(`Your Encryptify Verification code is: ${code}`);
            return { success: true };
        } catch (err) {
            return {
                error: { field: "SMS service Error", message: err.message || "An error has occurred" },
            };
        }
    }
}


export default new SMSService();