import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../commands/refresh-token.command';
import { AuthService } from '../auth.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
    constructor(private readonly authService: AuthService) { }

    async execute(command: RefreshTokenCommand) {
        const { refreshToken } = command;
        return this.authService.refreshAccessToken(refreshToken);
    }
} 