import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from '../../users/enums/user-role.enum';

@Entity('tbl_users')
export class User extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ name: 'phone_number', length: 10, unique: true })
    phoneNumber: string;

    @Column({ name: 'identity_number', length: 12, unique: true })
    identityNumber: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;
} 