import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';
import { AppNotAllowedException } from '../exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!requiredRoles) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		if (!user) {
			throw new AppNotAllowedException('User not found in request');
		}

		if (!requiredRoles.includes(user.role.toLowerCase())) {
			throw new AppNotAllowedException(`Forbidden: requires one of [${requiredRoles.join(', ')}]`);
		}

		return true;
	}
}
