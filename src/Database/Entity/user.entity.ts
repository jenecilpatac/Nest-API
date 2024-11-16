import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Posts } from './post.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Posts, posts => posts.user, { nullable: true })
  posts: Posts[];

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  date_of_birth: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true, unique: true })
  email?: string;

  @Column({ nullable: true, unique: true })
  username?: string;

  @Column({ nullable: true })
  email_verified_at?: Date;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  remember_token: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;
}
