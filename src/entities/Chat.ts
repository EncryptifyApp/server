import { Entity, BaseEntity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from 'typeorm';
import { Field, ObjectType } from 'type-graphql';
import { Message } from './Message';
import { User } from './User';

@ObjectType()
@Entity()
export class Chat extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [User])
  @ManyToMany(() => User, user => user.chats)
  @JoinTable()
  members: User[];

  @Field(() => [Message])
  @OneToMany(() => Message, message => message.chat)
  @JoinTable()
  messages: Message[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}