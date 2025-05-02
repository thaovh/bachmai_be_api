import { Controller, Post, Body, Headers, Ip, UseGuards, Req } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LoginCommand } from './commands/login.command';
import { LogoutCommand } from './commands/logout.command';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('login')
    @ApiOperation({ summary: 'Login with email, username, or identity number' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(
        @Body() loginDto: LoginDto,
        @Headers('user-agent') userAgent: string,
        @Ip() ipAddress: string,
    ) {
        return this.commandBus.execute(
            new LoginCommand(loginDto, userAgent, ipAddress),
        );
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(
        @Req() req: Request & { user: { id: string } },
        @Body('refreshToken') refreshToken: string,
    ) {
        return this.commandBus.execute(
            new LogoutCommand(req.user.id, refreshToken),
        );
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refreshToken(
        @Body('refreshToken') refreshToken: string,
        @Headers('user-agent') userAgent: string,
        @Ip() ipAddress: string,
    ) {
        return this.commandBus.execute(
            new RefreshTokenCommand(refreshToken, userAgent, ipAddress),
        );
    }
} 