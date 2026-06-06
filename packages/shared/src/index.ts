/**
 * Shared API contract between `@app/api` (NestJS) and `@app/web` (React).
 *
 * Types only — these declarations are erased at compile time, so this package
 * carries no runtime cost in either the CommonJS (Nest) or ESM (Vite) consumer.
 * Import them with `import type { ... } from "@app/shared"`.
 */

export enum DocumentStatus {
	PROCESSING = 'PROCESSING',
	VERIFIED = 'VERIFIED',
	REJECTED = 'REJECTED',
	INCONCLUSIVE = 'INCONCLUSIVE',
	ERROR = 'ERROR',
}

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	pages: number;
}

export interface User {
	id: string;
	email: string;
	name: string;
	role: 'seller' | 'admin';
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Document {
	id: string;
	userId: string;
	fileName: string;
	fileSize: number;
	status: DocumentStatus;
	verificationId: string | null;
	jobId: string | null;
	createdAt: Date;
	updatedAt: Date;
	sellerEmail?: string;
}

export interface AuditLog {
	id: string;
	documentId: string;
	previousStatus: DocumentStatus;
	nextStatus: DocumentStatus;
	actor: 'system' | 'admin' | 'seller';
	reason: string | null;
	createdAt: Date;
}

export interface ApiInfo {
	name: string;
	version: string;
	environment: string;
}

export interface HealthResponse {
	status: 'ok';
	uptimeSeconds: number;
	timestamp: string;
}

export interface GreetingRequest {
	name: string;
}

export interface GreetingResponse {
	message: string;
}
