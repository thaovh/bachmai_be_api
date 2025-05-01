import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async isUserExists(fields: Partial<User>): Promise<boolean> {
        if (fields.email) {
            const user = await this.userRepository.findOne({ where: { email: fields.email } });
            if (user) return true;
        }
        if (fields.username) {
            const user = await this.userRepository.findOne({ where: { username: fields.username } });
            if (user) return true;
        }
        if (fields.phoneNumber) {
            const user = await this.userRepository.findOne({ where: { phoneNumber: fields.phoneNumber } });
            if (user) return true;
        }
        if (fields.identityNumber) {
            const user = await this.userRepository.findOne({ where: { identityNumber: fields.identityNumber } });
            if (user) return true;
        }
        return false;
    }

    async createUser(createUserDto: any, createdBy?: string): Promise<User> {
        if (Array.isArray(createUserDto)) {
            throw new Error('createUserDto must be an object, not an array');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            createdBy: createdBy || 'system',
        }) as unknown as User;
        return this.userRepository.save(user);
    }

    async updateUser(user: User, updateUserDto: any, updatedBy?: string): Promise<User> {
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        Object.assign(user, {
            ...updateUserDto,
            updatedBy: updatedBy || 'system',
        });
        return this.userRepository.save(user);
    }
} 