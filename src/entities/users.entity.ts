import { IsEmpty, IsNotEmpty, isEmpty } from 'class-validator';
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '@interfaces/users.interface';
import { ProfileEntity } from './profile.entity';
import { RoleEntity } from './role.entity';


@Entity()
export class UserEntity extends BaseEntity implements User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @Unique(['email'])
  email: string;

  @Column({nullable: true})
  username: string;

  @Column({nullable:true})
  password: string;

  @Column({nullable: true})
  googleId: string;

  @Column({nullable:true})
  facebookId?: string;

  @Column({nullable: true})
  lastLogOut?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  emailVerificationTokenExpiresAt: Date;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetTokenExpiresAt: Date;

  @Column({ default: false })
  isApproved: boolean;

  //isAdmin
  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({default: false})
  isStaff: boolean;

  @OneToOne(() => ProfileEntity, {cascade: true})
  @JoinColumn()
  profile: ProfileEntity

  //one to many field with role
  @ManyToMany(() => RoleEntity, {cascade: true})
  @JoinTable()
  roles: RoleEntity[];
}
