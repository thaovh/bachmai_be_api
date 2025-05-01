import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

@Entity({ name: 'audit_log' })
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    userId: string | null;

    @Column({ name: 'action', type: 'varchar', length: 100 })
    action: string;

    @Column({ name: 'resource', type: 'varchar', length: 100 })
    resource: string;

    @Column({ name: 'old_value', type: 'jsonb', nullable: true })
    oldValue: any;

    @Column({ name: 'new_value', type: 'jsonb', nullable: true })
    newValue: any;

    @Column({ name: 'ip', type: 'varchar', length: 45, nullable: true })
    ip: string | null;

    @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
    userAgent: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', type: 'varchar', nullable: true })
    createdBy: string | null;

    @Column({ name: 'updated_by', type: 'varchar', nullable: true })
    updatedBy: string | null;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
} 