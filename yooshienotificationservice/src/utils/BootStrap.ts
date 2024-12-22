"use strict";

import { SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { fireBase } from "@lib/firebase";
import { sqsService } from "@lib/sqsService";
import { notificationDaoV1 } from "@modules/notification";

export class BootStrap {
  private dataBaseService = new Database();

  async bootStrap(server) {
    await this.dataBaseService.connectToDb();
    // await this.createAdmin();
    // await sqsService.createQueue("test-queue");
    // If redis is enabled
    if (SERVER.IS_REDIS_ENABLE) redisClient.init();
    if (SERVER.IS_FIREBASE_ENABLE) fireBase.init();
    // ENABLE/DISABLE Console Logs
    if (SERVER.ENVIRONMENT === "production") {
      console.log = function () {};
    }

    await sqsService.pollMessages();
  }
}

export const bootstrap = new BootStrap();
