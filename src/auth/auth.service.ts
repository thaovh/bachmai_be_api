import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { RefreshToken } from '../database/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { ERROR_CODES } from '../common/constants/error-codes';
import { AuditLogService } from '../common/services/audit-log.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private readonly auditLogService: AuditLogService,
    ) { }

    async validateUser(loginDto: LoginDto): Promise<User> {
        this.logger.log(`Validate user with identifier: ${loginDto.identifier}`);
        const { identifier, password } = loginDto;
        let user: User | undefined;

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
            // Email
            user = (await this.userRepository.findOne({ where: { email: identifier } })) || undefined;
        } else if (/^[0-9]{12}$/.test(identifier)) {
            // CCCD/IdentityNumber
            user = (await this.userRepository.findOne({ where: { identityNumber: identifier } })) || undefined;
        } else {
            // Username
            user = (await this.userRepository.findOne({ where: { username: identifier } })) || undefined;
        }

        if (!user) {
            this.logger.warn(`Login failed: User not found for identifier: ${identifier}`);
            throw new UnauthorizedException({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                code: ERROR_CODES.INVALID_CREDENTIALS,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Login failed: Invalid password for identifier: ${identifier}`);
            throw new UnauthorizedException({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                code: ERROR_CODES.INVALID_CREDENTIALS,
            });
        }

        this.logger.log(`User validated successfully: ${user.id}`);
        await this.auditLogService.logAction({
            userId: user.id,
            action: 'LOGIN',
            resource: 'auth',
            newValue: user,
            createdBy: user.username,
        });
        return user;
    }

    async generateTokens(user: User, userAgent?: string, ipAddress?: string) {
        this.logger.log(`Generating tokens for user: ${user.id}`);
        const payload = { sub: user.id, username: user.username, role: user.role };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.generateRefreshToken(user, userAgent, ipAddress);

        this.logger.log(`Tokens generated for user: ${user.id}`);
        return {
            accessToken,
            refreshToken: refreshToken.token,
            expiresIn: this.configService.get<string>('jwt.expiresIn'),
        };
    }

    private async generateRefreshToken(user: User, userAgent?: string, ipAddress?: string): Promise<RefreshToken> {
        this.logger.log(`Generating refresh token for user: ${user.id}`);
        const token = this.jwtService.sign(
            { sub: user.id },
            {
                secret: this.configService.get<string>('jwt.refreshSecret'),
                expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
            },
        );

        const refreshToken = this.refreshTokenRepository.create({
            userId: user.id,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdBy: userAgent,
            updatedBy: ipAddress,
        });

        this.logger.log(`Refresh token created for user: ${user.id}`);
        return this.refreshTokenRepository.save(refreshToken);
    }

    async refreshAccessToken(refreshToken: string): Promise<any> {
        this.logger.log(`Refreshing access token with refresh token: ${refreshToken.substring(0, 10)}...`);
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('jwt.refreshSecret'),
            });

            const token = await this.refreshTokenRepository.findOne({
                where: { token: refreshToken },
                relations: ['user'],
            });

            if (!token || !token.user || token.user.id !== payload.sub) {
                this.logger.warn('Refresh token invalid or user not found');
                throw new UnauthorizedException({
                    message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                    code: ERROR_CODES.INVALID_CREDENTIALS,
                });
            }

            if (new Date() > token.expiresAt) {
                await this.refreshTokenRepository.remove(token);
                this.logger.warn('Refresh token expired');
                throw new UnauthorizedException({
                    message: 'Refresh token expired',
                    code: ERROR_CODES.UNAUTHORIZED,
                });
            }

            this.logger.log(`Access token refreshed for user: ${token.user.id}`);
            await this.auditLogService.logAction({
                userId: token.user.id,
                action: 'REFRESH_TOKEN',
                resource: 'auth',
                createdBy: token.user.username,
            });
            return this.generateTokens(token.user);
        } catch (error) {
            this.logger.error('Error refreshing access token', error.stack);
            throw new UnauthorizedException({
                message: ERROR_MESSAGES.INVALID_CREDENTIALS,
                code: ERROR_CODES.INVALID_CREDENTIALS,
            });
        }
    }

    async logout(userId: string, refreshToken: string): Promise<void> {
        this.logger.log(`Logout for user: ${userId}`);
        await this.refreshTokenRepository.delete({ userId, token: refreshToken });
        this.logger.log(`User ${userId} logged out and refresh token deleted`);
        await this.auditLogService.logAction({
            userId,
            action: 'LOGOUT',
            resource: 'auth',
            createdBy: userId,
        });
    }
} 