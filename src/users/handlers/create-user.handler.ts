import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserCommand } from '../commands/create-user.command';
import { User } from '../../database/entities/user.entity';
import { ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { AuditLogService } from '../../common/services/audit-log.service';
import { UserService } from '../services/user.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    private readonly logger = new Logger(CreateUserHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly auditLogService: AuditLogService,
        private readonly userService: UserService,
    ) { }

    async execute(command: CreateUserCommand): Promise<User> {
        this.logger.log(`Creating user with email: ${command.createUserDto.email}`);
        const { createUserDto, createdBy } = command;

        // Check for existing user
        const exists = await this.userService.isUserExists(createUserDto);
        if (exists) {
            throw new ConflictException({
                message: ERROR_MESSAGES.USER_EXISTS,
                code: ERROR_CODES.USER_EXISTS,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create new user
        // const user = this.userRepository.create({
        //     ...createUserDto,
        //     password: hashedPassword,
        //     createdBy: createdBy || 'system',
        // });

        const saved = await this.userService.createUser({
            ...createUserDto,
            password: hashedPassword,
        }, createdBy);
        this.logger.log(`User created with id: ${saved.id}`);
        await this.auditLogService.logAction({
            userId: saved.id,
            action: 'CREATE_USER',
            resource: 'user',
            newValue: saved,
            createdBy: createdBy || 'system',
        });
        return saved;
    }
} 