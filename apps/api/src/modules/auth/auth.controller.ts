import { Body, Controller, Post } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { IAuthResponse } from '@app/shared';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	@Public()
	async login(@Body() loginDto: LoginDto): Promise<IAuthResponse> {
		const result = await this.authService.validateUser(loginDto);

		return plainToInstance(AuthResponseDto, result);
	}
}
