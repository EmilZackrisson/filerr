// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	type requestDocument = Models.Document & {
		user: string;
		name: string;
		text: string;
		type: string;
		completed: boolean;
		completedAt: Date;
		completedBy: string;
		completedMessage: string;
		status: string;
	};
	// interface Error {}
	// interface Locals {}
	// interface PageData {}
	// interface Platform {}
}

export {};
