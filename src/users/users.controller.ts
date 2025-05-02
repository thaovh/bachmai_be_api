import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserCommand } from './commands/create-user.command';
import { UpdateUserCommand } from './commands/update-user.command';
import { GetUserQuery, GetUsersQuery } from './queries/get-user.query';
import { User } from '../database/entities/user.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { PaginationResponseDto } from '../common/dto/pagination-response.dto';
import { PaginationMetaDto } from '../common/dto/pagination-meta.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = await this.commandBus.execute(new CreateUserCommand(createUserDto));
        return this.toUserResponseDto(user);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, description: 'Return all users' })
    async findAll(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<PaginationResponseDto<UserResponseDto>> {
        const [items, total] = await this.queryBus.execute(new GetUsersQuery(page, limit));
        const totalPages = Math.ceil(total / limit);
        const meta: PaginationMetaDto = {
            page,
            limit,
            totalItems: total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        };
        return { items: items.map(this.toUserResponseDto), meta };
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({ status: 200, description: 'Return the user' })
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
        const user = await this.queryBus.execute(new GetUserQuery(id));
        return this.toUserResponseDto(user);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.commandBus.execute(new UpdateUserCommand(id, updateUserDto));
    }

    private toUserResponseDto(user: User): UserResponseDto {
        const { id, email, username, phoneNumber, identityNumber, role, createdAt, updatedAt } = user;
        return { id, email, username, phoneNumber, identityNumber, role, createdAt, updatedAt };
    }
} 