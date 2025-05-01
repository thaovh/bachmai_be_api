import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { User } from '../database/entities/user.entity';
import { CreateUserHandler } from './handlers/create-user.handler';
import { UpdateUserHandler } from './handlers/update-user.handler';
import { GetUserHandler, GetUsersHandler } from './handlers/get-user.handler';
import { UserService } from './services/user.service';
import { CommonModule } from '../common/common.module';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([User]),
        CommonModule,
    ],
    controllers: [UsersController],
    providers: [
        ...CommandHandlers,
        ...QueryHandlers,
        UserService,
    ],
    exports: [TypeOrmModule, UserService],
})
export class UsersModule { } 