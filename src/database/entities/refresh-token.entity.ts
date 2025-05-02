import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('tbl_refresh_tokens')
export class RefreshToken extends BaseEntity {
    @Column({ name: 'user_id' })
    userId: string;

    @Column()
    token: string;

    @Column({ name: 'expires_at' })
    expiresAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;
} 