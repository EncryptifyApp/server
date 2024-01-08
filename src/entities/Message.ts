import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';
import { User } from './User';
import { Chat } from './Chat';

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => User)
  @ManyToOne(() => User)
  sender: User;

  @Field(() => User)
  @ManyToOne(() => User)
  receiver: User;

  @ManyToOne(() => Chat)
  chat?: Chat;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}