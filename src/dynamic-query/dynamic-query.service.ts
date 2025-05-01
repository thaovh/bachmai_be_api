import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicQuery } from '../database/entities/dynamic-query.entity';
import { OracleService } from '../common/services/oracle.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { Request } from 'express';

@Injectable()
export class DynamicQueryService {
    constructor(
        @InjectRepository(DynamicQuery)
        private readonly dynamicQueryRepo: Repository<DynamicQuery>,
        private readonly oracleService: OracleService,
        private readonly auditLogService: AuditLogService,
    ) { }

    async runQueryByName(name: string, params: any, page = 1, limit = 20, userId?: string, ip?: string, userAgent?: string) {
        const query = await this.dynamicQueryRepo.findOne({ where: { name } });
        if (!query) throw new NotFoundException('Query not found');
        if (!/^\s*SELECT\b/i.test(query.sql)) throw new ForbiddenException('Only SELECT allowed');
        const schema = query.paramsSchema ? JSON.parse(query.paramsSchema) : [];
        this.validateParams(schema, params);

        // Phân trang: thêm ROWNUM hoặc OFFSET/FETCH cho Oracle 12c
        let pagedSql = query.sql.trim();
        if (!/\bFETCH\b/i.test(pagedSql)) {
            pagedSql += ` OFFSET :_offset ROWS FETCH NEXT :_limit ROWS ONLY`;
            params._offset = (page - 1) * limit;
            params._limit = limit;
        }
        const rows = await this.oracleService.executeQuery(pagedSql, params);
        // Đếm tổng số dòng (nếu cần)
        const countSql = `SELECT COUNT(*) as TOTAL FROM (${query.sql}) t`;
        const countRows = await this.oracleService.executeQuery(countSql, params);
        const totalItems = countRows[0]?.TOTAL || 0;
        const meta = {
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            hasNext: page * limit < totalItems,
            hasPrev: page > 1,
        };
        // Ghi audit log
        await this.auditLogService.logAction({
            userId,
            action: 'dynamic_query',
            resource: name,
            newValue: { params, meta },
            ip,
            userAgent,
        });
        return {
            items: rows,
            meta,
        };
    }

    validateParams(schema: any[], params: any) {
        for (const def of schema) {
            const value = params[def.name];
            if (def.required && (value === undefined || value === null)) {
                throw new BadRequestException(`Missing required param: ${def.name}`);
            }
            if (value !== undefined && value !== null) {
                if (def.type === 'number' && isNaN(Number(value))) {
                    throw new BadRequestException(`Param ${def.name} must be a number`);
                }
                if (def.type === 'string' && typeof value !== 'string') {
                    throw new BadRequestException(`Param ${def.name} must be a string`);
                }
                if (def.format === 'date' && isNaN(Date.parse(value))) {
                    throw new BadRequestException(`Param ${def.name} must be a valid date`);
                }
            }
        }
    }
} 