// Steht alles in ../wiki/betterAuth.md

import { createAuthClient } from "better-auth/react"; // Use React import
import { organizationClient } from "better-auth/client/plugins";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		organizationClient({
			teams: {
				enabled: true,
			},
		}),
		inferAdditionalFields < typeof auth > (),
	],
	baseURL: "http://localhost:3000"
});