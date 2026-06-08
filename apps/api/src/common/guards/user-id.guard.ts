import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { PUBLIC_KEY } from '../decorators';
import { AppUnauthorizedException } from '../exceptions';

@Injectable()
export class UserIdGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private prisma: PrismaService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if (!authHeader) {
			throw new AppUnauthorizedException('Missing Authorization header');
		}

		const userId = authHeader.trim();
		if (!userId) {
			throw new AppUnauthorizedException('Invalid Authorization header');
		}

		const user = await (this.prisma.user.findUnique({
			where: { id: userId },
		}) as any);

		if (!user) {
			throw new AppUnauthorizedException('User not found');
		}

		request.user = user;

		return true;
	}
}
