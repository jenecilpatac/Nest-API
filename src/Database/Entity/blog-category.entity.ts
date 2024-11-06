import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Posts } from './post.entity';

@Entity()
export class BlogCategories {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Posts, (posts) => posts.blogCategory, { nullable: true })
  posts: Posts[];

  @Column({ nullable: true, unique: true })
  category_name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  slug: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;
}
