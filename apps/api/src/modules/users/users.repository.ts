import { Injectable } from '@nestjs/common';
import type { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
	constructor(private prisma: PrismaService) {}

	async findById(id: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { id } });
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({ where: { email } });
	}

	async create(data: {
		email: string;
		passwordHash: string;
		name: string;
		role: UserRole;
	}): Promise<User> {
		return this.prisma.user.create({ data });
	}
}
