import { PaginationMetaDto } from './pagination-meta.dto';

export class PaginationResponseDto<T> {
    items: T[];
    meta: PaginationMetaDto;
} 