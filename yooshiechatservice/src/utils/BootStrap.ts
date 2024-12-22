"use strict";

import { SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { SocketIO } from "../socket/socket";


export class BootStrap {
	private dataBaseService = new Database();

	async bootStrap(server) {
		await this.dataBaseService.connectToDb();
		// await this.createAdmin();

		// If redis is enabled
		if (SERVER.IS_REDIS_ENABLE) await redisClient.init();

		// ENABLE/DISABLE Console Logs
		if (SERVER.ENVIRONMENT === "production") {
			console.log = function () { };
		}
		await SocketIO.Instance(server)
	}
}

export const  bootstrap = new BootStrap();