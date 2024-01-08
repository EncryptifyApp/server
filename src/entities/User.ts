import { Field, ObjectType } from "type-graphql";
import { Column, Entity, BaseEntity, PrimaryColumn, OneToMany } from "typeorm";
import { Chat } from "./Chat";
import { Message } from "./Message";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field(() => String)
    @PrimaryColumn()
    id: string;

    @Field(() => String)
    @Column()
    username: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    profileUrl?: string;

    @Field(() => String)
    @Column()
    countryCode: string;

    @Field(() => String)
    @Column()
    phoneNumber: string;

    @Column()
    activeSessionToken?: string;

    @Field(() => String, { nullable: true })
    @Column()
    publicKey?: string;

    @OneToMany(() => Chat, chat => chat.members)
    chats: Chat[];

    @OneToMany(() => Message, message => message.sender)
    sentMessages: Message[];

    @OneToMany(() => Message, message => message)
    receivedMessages: Message[];

    @Field(() => Date, { nullable: true })
    @Column()
    createdAt: Date = new Date();

    @Field(() => Date, { nullable: true })
    @Column()
    updatedAt: Date = new Date();
}