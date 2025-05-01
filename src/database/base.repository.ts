import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';

export class BaseRepository<T extends { id: string }> extends Repository<T> {
    async findOneById(id: string): Promise<T | null> {
        return this.findOne({ where: { id } as FindOptionsWhere<T> });
    }

    async softDeleteById(id: string): Promise<void> {
        await this.softDelete(id);
    }

    async createAndSave(entity: DeepPartial<T>): Promise<T> {
        const created = this.create(entity);
        return this.save(created);
    }
} 