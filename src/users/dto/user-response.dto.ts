import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UserResponseDto {
    @ApiProperty() id: string;
    @ApiProperty() email: string;
    @ApiProperty() username: string;
    @ApiProperty() phoneNumber: string;
    @ApiProperty() identityNumber: string;
    @ApiProperty({ enum: UserRole }) role: UserRole;
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;
} 