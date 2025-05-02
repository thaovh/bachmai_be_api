import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from '../commands/update-user.command';
import { User } from '../../database/entities/user.entity';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../../common/constants/error-messages';
import { ERROR_CODES } from '../../common/constants/error-codes';
import { AuditLogService } from '../../common/services/audit-log.service';
import { UserService } from '../services/user.service';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    private readonly logger = new Logger(UpdateUserHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly auditLogService: AuditLogService,
        private readonly userService: UserService,
    ) { }

    async execute(command: UpdateUserCommand): Promise<User> {
        this.logger.log(`Updating user with id: ${command.id}`);
        const { id, updateUserDto, updatedBy } = command;

        // Find user
        const user = await this.userRepository.findOne({ where: { id } });
        const oldValue = user ? { ...user } : null;
        if (!user) {
            this.logger.warn(`User not found: ${id}`);
            throw new NotFoundException({
                message: ERROR_MESSAGES.USER_NOT_FOUND,
                code: ERROR_CODES.USER_NOT_FOUND,
            });
        }

        // Check for conflicts if unique fields are being updated
        const exists = await this.userService.isUserExists(updateUserDto);
        if (exists && user.id !== id) {
            throw new ConflictException({
                message: ERROR_MESSAGES.USER_EXISTS,
                code: ERROR_CODES.USER_EXISTS,
            });
        }

        // Hash password if it's being updated
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Update user
        const saved = await this.userService.updateUser(user, updateUserDto, updatedBy);
        this.logger.log(`User updated with id: ${saved.id}`);
        await this.auditLogService.logAction({
            userId: saved.id,
            action: 'UPDATE_USER',
            resource: 'user',
            oldValue,
            newValue: saved,
            createdBy: updatedBy || 'system',
        });
        return saved;
    }
} 