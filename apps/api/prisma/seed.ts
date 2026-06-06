import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
	const password = 'password123';
	const hashedPassword = await bcrypt.hash(password, 10);

	const sellers = await Promise.all(
		[1, 2, 3].map((i) =>
			prisma.user.upsert({
				where: { email: `seller${i}@test.com` },
				update: {},
				create: {
					email: `seller${i}@test.com`,
					passwordHash: hashedPassword,
					name: `Test Seller ${i}`,
					role: 'SELLER',
				},
			}),
		),
	);

	const admins = await Promise.all(
		[1, 2, 3].map((i) =>
			prisma.user.upsert({
				where: { email: `admin${i}@test.com` },
				update: {},
				create: {
					email: `admin${i}@test.com`,
					passwordHash: hashedPassword,
					name: `Test Admin ${i}`,
					role: 'ADMIN',
				},
			}),
		),
	);

	console.log({ sellers, admins });
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
