import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../commands/login.command';
import { AuthService } from '../auth.service';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
    constructor(private readonly authService: AuthService) { }

    async execute(command: LoginCommand) {
        const { loginDto, userAgent, ipAddress } = command;
        const user = await this.authService.validateUser(loginDto);
        return this.authService.generateTokens(user, userAgent, ipAddress);
    }
} 