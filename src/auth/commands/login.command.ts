import { LoginDto } from '../dto/login.dto';

export class LoginCommand {
    constructor(
        public readonly loginDto: LoginDto,
        public readonly userAgent?: string,
        public readonly ipAddress?: string,
    ) { }
} 