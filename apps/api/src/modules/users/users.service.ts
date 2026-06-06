import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
	constructor(private usersRepository: UsersRepository) {}

	async findById(id: string): Promise<User | null> {
		return this.usersRepository.findById(id);
	}

	async findByEmail(email: string): Promise<User | null> {
		return this.usersRepository.findByEmail(email);
	}

	async create(data: {
		email: string;
		passwordHash: string;
		name: string;
		role: 'SELLER' | 'ADMIN';
	}): Promise<User> {
		return this.usersRepository.create(data);
	}
}
