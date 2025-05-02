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

        // Tìm tất cả các tham số trong câu SQL
        const paramMatches = query.sql.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        const sqlParams = [...new Set(paramMatches.map(match => match.substring(1)))];

        // Thêm các tham số thiếu với giá trị null
        const finalParams = { ...params };
        for (const param of sqlParams) {
            if (finalParams[param] === undefined) {
                finalParams[param] = null;
            }
        }

        // Thực hiện query gốc để lấy tổng số dòng
        const countSql = `SELECT COUNT(*) as TOTAL FROM (${query.sql}) t`;
        const countRows = await this.oracleService.executeQuery(countSql, finalParams);
        const totalItems = countRows[0]?.TOTAL || 0;

        // Thêm phân trang vào câu SQL
        let pagedSql = query.sql.trim();
        if (!/\bFETCH\b/i.test(pagedSql)) {
            const start = (page - 1) * limit;
            const end = page * limit;
            pagedSql = `
                SELECT * FROM (
                    SELECT a.*, ROWNUM rnum FROM (
                        ${pagedSql}
                    ) a WHERE ROWNUM <= ${end}
                ) WHERE rnum > ${start}
            `;
        }

        const rows = await this.oracleService.executeQuery(pagedSql, finalParams);

        const pagination = {
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
            newValue: { params: finalParams, pagination },
            ip,
            userAgent,
        });

        return {
            items: rows,
            pagination,
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

    async createDynamicQuery(dto: any, userId?: string, ip?: string, userAgent?: string) {
        const exist = await this.dynamicQueryRepo.findOne({ where: { name: dto.name } });
        if (exist) throw new BadRequestException('Query name already exists');
        const entity = this.dynamicQueryRepo.create({
            ...dto,
            createdBy: userId,
            updatedBy: userId,
        });
        const saved = await this.dynamicQueryRepo.save(entity);
        await this.auditLogService.logAction({
            userId,
            action: 'create_dynamic_query',
            resource: dto.name,
            newValue: dto,
            ip,
            userAgent,
        });
        return saved;
    }

    async updateDynamicQuery(id: string, dto: any, userId?: string, ip?: string, userAgent?: string) {
        const entity = await this.dynamicQueryRepo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException('Dynamic query not found');
        Object.assign(entity, dto, { updatedBy: userId });
        const saved = await this.dynamicQueryRepo.save(entity);
        await this.auditLogService.logAction({
            userId,
            action: 'update_dynamic_query',
            resource: entity.name,
            newValue: dto,
            ip,
            userAgent,
        });
        return saved;
    }

    async deleteDynamicQuery(id: string, userId?: string, ip?: string, userAgent?: string) {
        const entity = await this.dynamicQueryRepo.findOne({ where: { id } });
        if (!entity) throw new NotFoundException('Dynamic query not found');
        await this.dynamicQueryRepo.softDelete(id);
        await this.auditLogService.logAction({
            userId,
            action: 'delete_dynamic_query',
            resource: entity.name,
            oldValue: entity,
            ip,
            userAgent,
        });
        return { success: true };
    }

    async getDynamicQueries(page = 1, limit = 20, name?: string) {
        const qb = this.dynamicQueryRepo.createQueryBuilder('q')
            .where('q.deletedAt IS NULL');
        if (name) {
            qb.andWhere('q.name ILIKE :name', { name: `%${name}%` });
        }
        qb.orderBy('q.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        const [items, totalItems] = await qb.getManyAndCount();
        return {
            items,
            meta: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                hasNext: page * limit < totalItems,
                hasPrev: page > 1,
            },
        };
    }

    async getDynamicQueryDetail(id: string) {
        const entity = await this.dynamicQueryRepo.findOne({ where: { id } });
        if (!entity || entity.deletedAt) throw new NotFoundException('Dynamic query not found');
        return entity;
    }
} 