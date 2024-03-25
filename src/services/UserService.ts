import { User } from "../entities/User";


class UserService {
    generateLicenseKey() {
        const length = 15;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            key += characters[randomIndex];
        }
    
        
        key = key.slice(0, 5) + '-' + key.slice(5, 10) + '-' + key.slice(10, 15);   
    
        return key;
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

    async getUserByLicenseKey(licenseKey: string): Promise<User | null> {
        try {
            const user = await User.findOne({
                where: {
                    licenseKey: licenseKey,
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