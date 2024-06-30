import { Field, ObjectType } from "type-graphql";
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Chat } from "./Chat";
import { Message } from "./Message";
import { Subscription } from "./Subscription";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Field(() => String, { nullable: true })
    @Column({nullable: true})
    username: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    profileUrl?: string;

    @Field(() => String, { nullable: true })
    @Column({unique: true})
    licenseKey: string;

    @Column({ nullable: true })
    activeSessionToken?: string;

    @Field(() => String, { nullable: true })
    @Column({nullable: true})
    publicKey?: string;

    @Field(() => String, { nullable: true })
    @Column({nullable: true})
    encryptedPrivateKey?: string;

    @Field(() => String, { nullable: true })
    @Column({nullable: true})
    expoPushToken?: string;

    @OneToMany(() => Chat, chat => chat.members)
    chats: Chat[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Message, message => message)
    receivedMessages: Message[];

    @OneToMany(() => Subscription, subscription => subscription.user)
    subscriptions: Subscription[];

    @Field(() => Date, { nullable: true })
    @Column()
    createdAt: Date = new Date();

    @Field(() => Date, { nullable: true })
    @Column()
    updatedAt: Date = new Date();
}