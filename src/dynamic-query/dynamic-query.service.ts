import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DynamicQuery } from '../database/entities/dynamic-query.entity';
import { OracleService } from '../common/services/oracle.service';
import { AuditLogService } from '../common/services/audit-log.service';
import { CreateDynamicQueryDto } from './dto/create-dynamic-query.dto';
import { UpdateDynamicQueryDto } from './dto/update-dynamic-query.dto';

@Injectable()
export class DynamicQueryService {
    constructor(
        @InjectRepository(DynamicQuery)
        private readonly dynamicQueryRepository: Repository<DynamicQuery>,
        private readonly oracleService: OracleService,
        private readonly auditLogService: AuditLogService,
    ) {}

    async getDynamicQueries(page: number = 1, limit: number = 20, name?: string) {
        const [items, total] = await this.dynamicQueryRepository.findAndCount({
            where: name ? { name: Like(`%${name}%`) } : {},
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
        });

        return {
            items,
            pagination: {
                total,
                page,
                limit,
            },
        };
    }

    async getDynamicQueryDetail(id: string) {
        const query = await this.dynamicQueryRepository.findOne({ where: { id } });
        if (!query) {
            throw new NotFoundException('Dynamic query not found');
        }
        return query;
    }

    async runQueryByName(name: string, params: any, page: number = 1, limit: number = 20, userId: string, ip: string, userAgent: string) {
        const query = await this.dynamicQueryRepository.findOne({ where: { name } });
        if (!query) {
            throw new NotFoundException('Dynamic query not found');
        }

        // Validate parameters
        if (query.paramsSchema) {
            const paramsSchema = JSON.parse(query.paramsSchema);
            this.validateParams(params, paramsSchema);
        }

        // Find all parameters used in the SQL query
        const paramMatches = query.sql.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g) || [];
        const uniqueParams = [...new Set(paramMatches.map(p => p.substring(1)))];

        // Create final params object with null for missing parameters
        const finalParams = { ...params };
        uniqueParams.forEach(param => {
            if (!(param in finalParams)) {
                finalParams[param] = null;
            }
        });

        // Execute query
        const result = await this.oracleService.executeQuery(query.sql, finalParams);

        // Log the execution
        await this.auditLogService.logAction({
            userId,
            action: 'EXECUTE',
            resource: `dynamic-query/${query.id}`,
            newValue: { params: finalParams },
            ip,
            userAgent,
            createdBy: userId,
        });

        return {
            items: result,
            pagination: {
                total: result.length,
                page,
                limit,
            },
        };
    }

    async createDynamicQuery(dto: CreateDynamicQueryDto, userId: string, ip: string, userAgent: string) {
        // Validate params schema if provided
        if (dto.paramsSchema) {
            try {
                JSON.parse(dto.paramsSchema);
            } catch (error) {
                throw new BadRequestException('Invalid params schema format');
            }
        }

        const query = this.dynamicQueryRepository.create(dto);
        const savedQuery = await this.dynamicQueryRepository.save(query);

        // Log the creation
        await this.auditLogService.logAction({
            userId,
            action: 'CREATE',
            resource: `dynamic-query/${savedQuery.id}`,
            newValue: savedQuery,
            ip,
            userAgent,
            createdBy: userId,
        });

        return savedQuery;
    }

    async updateDynamicQuery(id: string, dto: UpdateDynamicQueryDto, userId: string, ip: string, userAgent: string) {
        const query = await this.dynamicQueryRepository.findOne({ where: { id } });
        if (!query) {
            throw new NotFoundException('Dynamic query not found');
        }

        // Validate params schema if provided
        if (dto.paramsSchema) {
            try {
                JSON.parse(dto.paramsSchema);
            } catch (error) {
                throw new BadRequestException('Invalid params schema format');
            }
        }

        const oldValue = { ...query };
        Object.assign(query, dto);
        const updatedQuery = await this.dynamicQueryRepository.save(query);

        // Log the update
        await this.auditLogService.logAction({
            userId,
            action: 'UPDATE',
            resource: `dynamic-query/${id}`,
            oldValue,
            newValue: updatedQuery,
            ip,
            userAgent,
            createdBy: userId,
        });

        return updatedQuery;
    }

    async deleteDynamicQuery(id: string, userId: string, ip: string, userAgent: string) {
        const query = await this.dynamicQueryRepository.findOne({ where: { id } });
        if (!query) {
            throw new NotFoundException('Dynamic query not found');
        }

        const oldValue = { ...query };
        await this.dynamicQueryRepository.remove(query);

        // Log the deletion
        await this.auditLogService.logAction({
            userId,
            action: 'DELETE',
            resource: `dynamic-query/${id}`,
            oldValue,
            ip,
            userAgent,
            createdBy: userId,
        });

        return { success: true };
    }

    private validateParams(params: any, paramsSchema: any[]) {
        for (const param of paramsSchema) {
            const value = params[param.name];
            
            // Check required parameters
            if (param.required && (value === undefined || value === null)) {
                throw new BadRequestException(`Parameter ${param.name} is required`);
            }

            // Skip type validation for null/undefined optional parameters
            if (!param.required && (value === undefined || value === null)) {
                continue;
            }

            // Validate parameter type
            switch (param.type.toLowerCase()) {
                case 'number':
                    if (typeof value !== 'number') {
                        throw new BadRequestException(`Parameter ${param.name} must be a number`);
                    }
                    break;
                case 'string':
                    if (typeof value !== 'string') {
                        throw new BadRequestException(`Parameter ${param.name} must be a string`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        throw new BadRequestException(`Parameter ${param.name} must be a boolean`);
                    }
                    break;
                case 'date':
                    if (!(value instanceof Date) && isNaN(Date.parse(value))) {
                        throw new BadRequestException(`Parameter ${param.name} must be a valid date`);
                    }
                    break;
                default:
                    throw new BadRequestException(`Unsupported parameter type: ${param.type}`);
            }
        }
    }
}
