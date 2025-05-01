import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../commands/logout.command';
import { AuthService } from '../auth.service';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
    constructor(private readonly authService: AuthService) { }

    async execute(command: LogoutCommand) {
        const { userId, refreshToken } = command;
        await this.authService.logout(userId, refreshToken);
        return { message: 'Logged out successfully' };
    }
} 