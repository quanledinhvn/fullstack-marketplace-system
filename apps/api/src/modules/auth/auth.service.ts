import { Injectable } from '@nestjs/common';
import { AppUnauthorizedException } from '../../common/exceptions';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService) {}

	async validateUser(loginDto: LoginDto) {
		const user = await this.usersService.findByEmail(loginDto.email);

		if (!user) {
			throw new AppUnauthorizedException('Invalid email or password');
		}

		const passwordMatch = await bcrypt.compare(loginDto.password, user.passwordHash);

		if (!passwordMatch) {
			throw new AppUnauthorizedException('Invalid email or password');
		}

		return {
			userId: user.id,
			role: user.role.toLowerCase(),
			name: user.name,
			email: user.email,
		};
	}
}
