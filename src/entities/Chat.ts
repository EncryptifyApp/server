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

  @Field(() => [User],{nullable:true})
  @ManyToMany(() => User, user => user.chats)
  @JoinTable()
  members: User[];

  @Field(() => [Message],{nullable:true})
  @OneToMany(() => Message, message => message.chat)
  @JoinTable()
  messages: Message[];

  @Field({nullable:true})
  @CreateDateColumn()
  createdAt: Date;

  @Field({nullable:true})
  @UpdateDateColumn()
  updatedAt: Date;
}