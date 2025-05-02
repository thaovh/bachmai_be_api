import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'abc@gmail.com hoặc johndoe hoặc 123456789012' })
    @IsString()
    identifier: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(8)
    password: string;
} 