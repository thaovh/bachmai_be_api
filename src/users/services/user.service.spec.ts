import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
    let service: UserService;
    let userRepository: any;

    beforeEach(async () => {
        userRepository = {
            create: jest.fn((dto) => dto),
            save: jest.fn((user) => Promise.resolve(user)),
            findOne: jest.fn(() => null),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: getRepositoryToken(User), useValue: userRepository },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
    });

    it('should hash password when creating user', async () => {
        const dto = { email: 'a@a.com', username: 'a', password: '12345678' };
        const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed');
        await service.createUser(dto);
        expect(hashSpy).toHaveBeenCalledWith('12345678', 10);
        expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({ password: 'hashed' }));
        expect(userRepository.save).toHaveBeenCalled();
    });
}); 