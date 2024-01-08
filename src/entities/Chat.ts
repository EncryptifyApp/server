import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { Message } from './Message';
import { User } from './User';

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => [User])
  @ManyToMany(() => User, user => user.chats)
  @JoinTable()
  members: User[];

  @Field(() => [Message])
  @OneToMany(() => Message, message => message.chat)
  messages: Message[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}