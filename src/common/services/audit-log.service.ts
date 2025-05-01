import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    async logAction(params: {
        userId?: string;
        action: string;
        resource: string;
        oldValue?: any;
        newValue?: any;
        ip?: string;
        userAgent?: string;
        createdBy?: string;
    }): Promise<AuditLog> {
        const log = this.auditLogRepository.create({
            userId: params.userId || null,
            action: params.action,
            resource: params.resource,
            oldValue: params.oldValue || null,
            newValue: params.newValue || null,
            ip: params.ip || null,
            userAgent: params.userAgent || null,
            createdBy: params.createdBy || null,
            updatedBy: params.createdBy || null,
        });
        return this.auditLogRepository.save(log);
    }
} 