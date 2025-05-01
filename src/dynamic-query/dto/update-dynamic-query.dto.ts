import { IsString, IsOptional } from 'class-validator';

export class UpdateDynamicQueryDto {
    @IsString()
    @IsOptional()
    sql?: string;

    @IsString()
    @IsOptional()
    paramsSchema?: string;

    @IsString()
    @IsOptional()
    description?: string;
} 