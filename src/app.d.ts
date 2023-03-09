// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	interface FileRequest {
		fileName: string;
		text?: string;
		completed?: boolean;
		completedAt?: Date;
		completedBy?: string;
		user: string;
		id: ID;
		createdAt: Date;
		updatedAt: Date;
	}
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

export {};
