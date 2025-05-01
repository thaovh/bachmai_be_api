import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'johndoe' })
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password too weak',
    })
    password: string;

    @ApiProperty({ example: '0123456789' })
    @IsString()
    @Length(10, 10)
    @Matches(/^[0-9]+$/, {
        message: 'Phone number must contain only numbers',
    })
    phoneNumber: string;

    @ApiProperty({ example: '123456789012' })
    @IsString()
    @Length(12, 12)
    @Matches(/^[0-9]+$/, {
        message: 'Identity number must contain only numbers',
    })
    identityNumber: string;

    @ApiProperty({ enum: UserRole, example: UserRole.USER, default: UserRole.USER })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
} 