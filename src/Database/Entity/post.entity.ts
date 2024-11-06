import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './user.entity';
import { BlogCategories } from './blog-category.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => Users, (user) => user.posts, { nullable: true, eager: true })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @ManyToOne(() => BlogCategories, (blogCategory) => blogCategory.posts, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'blog_category_id' })
  blogCategory: BlogCategories;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at?: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at?: Date;
}
