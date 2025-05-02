import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicQuery } from '../database/entities/dynamic-query.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { DynamicQueryService } from './dynamic-query.service';
import { DynamicQueryController } from './dynamic-query.controller';
import { OracleService } from '../common/services/oracle.service';
import { AuditLogService } from '../common/services/audit-log.service';

@Module({
    imports: [TypeOrmModule.forFeature([DynamicQuery, AuditLog])],
    providers: [DynamicQueryService, OracleService, AuditLogService],
    controllers: [DynamicQueryController],
    exports: [DynamicQueryService],
})
export class DynamicQueryModule { } 