"use strict";

import { SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { schedulerControllerV1 } from "@lib/index";

export class BootStrap {
  private dataBaseService = new Database();

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    // await this.createAdmin();
    if (SERVER.ENVIRONMENT !== "production") schedulerControllerV1.init();

    // If redis is enabled
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();

    // ENABLE/DISABLE Console Logs
    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }
  }
}

export const bootstrap = new BootStrap();
