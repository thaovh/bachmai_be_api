import { Controller, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { DynamicQueryService } from './dynamic-query.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('dynamic-query')
export class DynamicQueryController {
    constructor(private readonly dynamicQueryService: DynamicQueryService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':name')
    async runDynamicQuery(
        @Param('name') name: string,
        @Body('params') params: any,
        @Body('page') page: number = 1,
        @Body('limit') limit: number = 20,
        @Req() req: Request,
    ) {
        const userId = (req.user as any)?.userId || (req.user as any)?.id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dynamicQueryService.runQueryByName(name, params, page, limit, userId, ip, userAgent);
    }
} 