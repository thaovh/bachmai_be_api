import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { dataSourceOptions } from '../config/data-source';
import { UserRole } from '../users/enums/user-role.enum';

async function seedAdmin() {
    const dataSource = new DataSource({
        ...dataSourceOptions,
        entities: [User],
    });
    await dataSource.initialize();

    const userRepo = dataSource.getRepository(User);

    const exist = await userRepo.findOne({ where: { identityNumber: '035081000222' } });
    if (exist) {
        console.log('Admin user already exists');
        await dataSource.destroy();
        return;
    }

    const password = await bcrypt.hash('12345678', 10);
    const admin = userRepo.create({
        email: 'admin@example.com',
        username: 'admin',
        password,
        phoneNumber: '0123456789',
        identityNumber: '035081000222',
        role: UserRole.ADMIN,
        isActive: true,
        createdBy: 'seed',
        updatedBy: 'seed',
    });
    await userRepo.save(admin);
    console.log('Admin user seeded');
    await dataSource.destroy();
}

seedAdmin().catch(e => { console.error(e); process.exit(1); }); 