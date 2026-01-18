import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import db from "./db";

export const auth = betterAuth({
	database: new Database("dev.db"),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		deleteUser: {
			enabled: true
		},
		additionalFields: {
			isTeamAccount: {
				type: "boolean",
				required: false,
				defaultValue: false,
			},
			team: {
				type: "string", // JSON string für Array
				required: false,
			},
		},
	},
	advanced: {
		database: {
			useNumberId: true,
		},
	},
});