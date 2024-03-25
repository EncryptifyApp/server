import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinTable } from 'typeorm';
import { Field,ObjectType } from 'type-graphql';
import { User } from './User';
import { Chat } from './Chat';
import { MessageStatus } from '../enums/MessageStatus';

@ObjectType()
@Entity()
export class Message extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column()
  content: string;

  @Field(() => User)
  @ManyToOne(() => User)
  @JoinTable()
  sender: User;

  @Field(() => MessageStatus)
  @Column({
    type: 'enum',
    enum: MessageStatus,
  })
  status: MessageStatus;

  @Field(() => Chat,{nullable:true})
  @ManyToOne(() => Chat)
  @JoinTable()
  chat?: Chat;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}