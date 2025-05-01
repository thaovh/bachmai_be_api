import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserCommand } from '../commands/create-user.command';
import { User } from '../../database/entities/user.entity';
import { ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
    private readonly logger = new Logger(CreateUserHandler.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async execute(command: CreateUserCommand): Promise<User> {
        this.logger.log(`Creating user with email: ${command.createUserDto.email}`);
        const { createUserDto, createdBy } = command;

        // Check for existing user
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: createUserDto.email },
                { username: createUserDto.username },
                { phoneNumber: createUserDto.phoneNumber },
                { identityNumber: createUserDto.identityNumber },
            ],
        });

        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        // Create new user
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            createdBy: createdBy || 'system',
        });

        const saved = await this.userRepository.save(user);
        this.logger.log(`User created with id: ${saved.id}`);
        return saved;
    }
} 