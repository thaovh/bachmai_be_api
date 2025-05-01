import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDynamicQueryDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    sql: string;

    @IsString()
    @IsOptional()
    paramsSchema?: string;

    @IsString()
    @IsOptional()
    description?: string;
} 