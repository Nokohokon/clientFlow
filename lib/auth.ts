import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
	database: new Database("dev.db"),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		organization({
			teams: {
				enabled: true,
			},
		}),
	],
	user: {
		deleteUser: {
			enabled: true
		},
		additionalFields: {
			initialized: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
		},
	},
	advanced: {
		database: {
			useNumberId: true,
		},
		cookiePrefix: "client_garage",
	},
});