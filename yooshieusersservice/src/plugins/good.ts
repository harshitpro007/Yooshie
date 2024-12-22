"use strict";

import * as good from "@hapi/good";

// Register Good
export const plugin = {
	name: "good-plugin",
	register: async function (server) {
		const goodOptions = {
			ops: {
				interval: (30000000)
			},
			reporters: {
				console: [{
					module: "@hapi/good-console",
					args: [{ log: "*", response: "*" }]
				}, "stdout"]
			}
		};
		await server.register({
			plugin: good,
			options: goodOptions
		});
	}
};