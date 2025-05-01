import { Controller, Post, Param, Body, UseGuards, Req, Patch, Delete, Get, Query } from '@nestjs/common';
import { DynamicQueryService } from './dynamic-query.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateDynamicQueryDto } from './dto/create-dynamic-query.dto';
import { UpdateDynamicQueryDto } from './dto/update-dynamic-query.dto';

@Controller('dynamic-query')
export class DynamicQueryController {
    constructor(private readonly dynamicQueryService: DynamicQueryService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getDynamicQueries(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
        @Query('name') name?: string,
    ) {
        return this.dynamicQueryService.getDynamicQueries(page, limit, name);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getDynamicQueryDetail(@Param('id') id: string) {
        return this.dynamicQueryService.getDynamicQueryDetail(id);
    }

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

    @UseGuards(JwtAuthGuard)
    @Post()
    async createDynamicQuery(
        @Body() dto: CreateDynamicQueryDto,
        @Req() req: Request,
    ) {
        const userId = (req.user as any)?.userId || (req.user as any)?.id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dynamicQueryService.createDynamicQuery(dto, userId, ip, userAgent);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updateDynamicQuery(
        @Param('id') id: string,
        @Body() dto: UpdateDynamicQueryDto,
        @Req() req: Request,
    ) {
        const userId = (req.user as any)?.userId || (req.user as any)?.id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dynamicQueryService.updateDynamicQuery(id, dto, userId, ip, userAgent);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteDynamicQuery(
        @Param('id') id: string,
        @Req() req: Request,
    ) {
        const userId = (req.user as any)?.userId || (req.user as any)?.id;
        const ip = req.ip;
        const userAgent = req.headers['user-agent'];
        return this.dynamicQueryService.deleteDynamicQuery(id, userId, ip, userAgent);
    }
} 