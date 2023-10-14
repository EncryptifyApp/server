require('dotenv').config()
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { VerificationCode } from "./entities/VerificationCode";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : 5432,
  username: process.env.DATABASE_USERNAME || "postgres",
  password: process.env.DATABASE_PASSWORD || "postgres",
  database: process.env.DATABASE_NAME || "Encryptify",
  entities: [User, VerificationCode],
  synchronize: true,
  logging: false,
});

export { AppDataSource };