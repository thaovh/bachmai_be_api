import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserCommand } from '../commands/update-user.command';
import { User } from '../../database/entities/user.entity';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
    private readonly logger = new Logger(UpdateUserHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async execute(command: UpdateUserCommand): Promise<User> {
        this.logger.log(`Updating user with id: ${command.id}`);
        const { id, updateUserDto, updatedBy } = command;

        // Find user
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            this.logger.warn(`User not found: ${id}`);
            throw new NotFoundException('User not found');
        }

        // Check for conflicts if unique fields are being updated
        const uniqueFieldsToCheck = [];
        if (updateUserDto.email) uniqueFieldsToCheck.push({ email: updateUserDto.email });
        if (updateUserDto.username) uniqueFieldsToCheck.push({ username: updateUserDto.username });
        if (updateUserDto.phoneNumber) uniqueFieldsToCheck.push({ phoneNumber: updateUserDto.phoneNumber });
        if (updateUserDto.identityNumber) uniqueFieldsToCheck.push({ identityNumber: updateUserDto.identityNumber });

        if (uniqueFieldsToCheck.length > 0) {
            const existingUser = await this.userRepository.findOne({
                where: uniqueFieldsToCheck,
            });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('User with these details already exists');
            }
        }

        // Hash password if it's being updated
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        // Update user
        Object.assign(user, {
            ...updateUserDto,
            updatedBy: updatedBy || 'system',
        });

        const saved = await this.userRepository.save(user);
        this.logger.log(`User updated with id: ${saved.id}`);
        return saved;
    }
} 