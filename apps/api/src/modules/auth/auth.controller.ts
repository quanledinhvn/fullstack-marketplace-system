import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post('login')
	@Public()
	async login(@Body() loginDto: LoginDto) {
		return this.authService.validateUser(loginDto);
	}
}
