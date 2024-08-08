import { AppDataSource } from "../type-orm.config";
import { userSeeder } from "./user.seeder"

export const seed = async () => {
    //type-orm
    await AppDataSource.initialize().then(() => {
        console.log(`🚀  Database ready`);
    })

    await userSeeder(50);
}

seed().then(() => {
    console.log('Seeding completed');
}).catch((err) => {
    console.log('Seeding failed', err);
});