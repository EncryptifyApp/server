import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @Column()
  startDate: Date;

  @Field(() => Date)
  @Column()
  endDate: Date;

  @ManyToOne(() => User, user => user.subscriptions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Date, { nullable: true })
  @Column()
  createdAt: Date = new Date();

  @Field(() => Date, { nullable: true })
  @Column()
  updatedAt: Date = new Date();
}