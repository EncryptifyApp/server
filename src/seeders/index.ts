import { userSeeder } from "./user.seeder"

export const seed = async () => {
    await userSeeder(2);
}