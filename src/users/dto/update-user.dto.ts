import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'john.doe@example.com' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'johndoe' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    username?: string;

    @ApiPropertyOptional({ example: 'Password123!' })
    @IsOptional()
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password too weak',
    })
    password?: string;

    @ApiPropertyOptional({ example: '0123456789' })
    @IsOptional()
    @IsString()
    @Length(10, 10)
    @Matches(/^[0-9]+$/, {
        message: 'Phone number must contain only numbers',
    })
    phoneNumber?: string;

    @ApiPropertyOptional({ example: '123456789012' })
    @IsOptional()
    @IsString()
    @Length(12, 12)
    @Matches(/^[0-9]+$/, {
        message: 'Identity number must contain only numbers',
    })
    identityNumber?: string;

    @ApiPropertyOptional({ enum: UserRole, example: UserRole.USER })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
} 