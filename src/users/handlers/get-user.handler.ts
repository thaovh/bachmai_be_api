import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUserQuery, GetUsersQuery } from '../queries/get-user.query';
import { User } from '../../database/entities/user.entity';
import { NotFoundException, Logger } from '@nestjs/common';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { AuditLogService } from '../../common/services/audit-log.service';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
    private readonly logger = new Logger(GetUserHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly auditLogService: AuditLogService,
    ) { }

    async execute(query: GetUserQuery): Promise<User> {
        this.logger.log(`Fetching user with id: ${query.id}`);
        const user = await this.userRepository.findOne({ where: { id: query.id } });
        if (!user) {
            this.logger.warn(`User not found: ${query.id}`);
            throw new NotFoundException({
                message: ERROR_MESSAGES.USER_NOT_FOUND,
                code: ERROR_CODES.USER_NOT_FOUND,
            });
        }
        this.logger.log(`User fetched with id: ${user.id}`);
        await this.auditLogService.logAction({
            userId: user.id,
            action: 'GET_USER',
            resource: 'user',
            newValue: user,
        });
        return user;
    }
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
    private readonly logger = new Logger(GetUsersHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async execute(query: GetUsersQuery): Promise<[User[], number]> {
        this.logger.log(`Fetching users page: ${query.page}, limit: ${query.limit}`);
        const [users, total] = await this.userRepository.findAndCount({
            skip: (query.page - 1) * query.limit,
            take: query.limit,
            order: { createdAt: 'DESC' },
        });
        this.logger.log(`Fetched ${users.length} users, total: ${total}`);
        return [users, total];
    }
} 