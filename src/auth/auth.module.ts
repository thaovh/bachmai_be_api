import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { LoginHandler } from './handlers/login.handler';
import { LogoutHandler } from './handlers/logout.handler';
import { RefreshTokenHandler } from './handlers/refresh-token.handler';
import { CommonModule } from '../common/common.module';

const commandHandlers = [LoginHandler, LogoutHandler, RefreshTokenHandler];

@Module({
    imports: [
        CqrsModule,
        PassportModule,
        TypeOrmModule.forFeature([User, RefreshToken]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('jwt.expiresIn'),
                },
            }),
            inject: [ConfigService],
        }),
        CommonModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        ...commandHandlers,
    ],
    exports: [AuthService],
})
export class AuthModule { } 