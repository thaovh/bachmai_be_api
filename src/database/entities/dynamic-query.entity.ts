import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'dynamic_queries' })
export class DynamicQuery extends BaseEntity {
    @Column({ unique: true })
    name: string;

    @Column({ type: 'text' })
    sql: string;

    @Column({ name: 'params_schema', type: 'text', nullable: true })
    paramsSchema: string; // JSON string

    @Column({ type: 'text', nullable: true })
    description: string;
} 