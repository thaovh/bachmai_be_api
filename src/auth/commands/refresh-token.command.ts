export class RefreshTokenCommand {
    constructor(
        public readonly refreshToken: string,
        public readonly userAgent?: string,
        public readonly ipAddress?: string,
    ) { }
} 