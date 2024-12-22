"use strict";

import * as redis from "redis";
import * as util from "util";
import { SERVER, } from "@config/index";
import { logger } from "@lib/logger";

let client;
let pub, sub;

export class RedisClient {

	init() {
		const _this = this;
		let CONF:any = { db: SERVER.REDIS.DB };
		const ENVIRONMENT = process.env.NODE_ENV.trim();
		if(ENVIRONMENT==="production" || ENVIRONMENT=== "preprod") {
			CONF.tls= {};
		}
		client = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF, { disable_resubscribing: true });
		client.on("ready", () => {
			logger.info(`Redis server listening on ${SERVER.REDIS.HOST}:${SERVER.REDIS.PORT}, in ${SERVER.REDIS.DB} DB`);
		});
		client.on("error", (error) => {
			logger.error("Error in Redis", error);
			console.log("Error in Redis");
		});

		// .: Activate "notify-keyspace-events" for expired type events
		pub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		sub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
		// .: Subscribe to the "notify-keyspace-events" channel used for expired type events
		function SubscribeExpired(e, r) {
			const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
			sub.subscribe(expired_subKey, function () {
				sub.on("message", function (chan, msg) {
				});
			});
		}
	}

	setExp(key, exp, value) {
		console.log('key',key,'>>>>>>>>>>>>>>>>>>>>',exp,'fffffffffffffff',value)
		client.setex(key, exp, value);
	}

	getKeys(key) {
		return new Promise((resolve, reject) => {
			client.multi().keys(key).exec(function (error, reply) { if (error) reject(error); else resolve(reply[0]) });
		});
	}

	storeValue(key, value) {
		return client.set(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	mset(values) {
		client.mset(values, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getValue(key) {
		return new Promise(function (resolve, reject) {
			client.get(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeHash(key, value) {
		return client.hmset(key, value, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getHash(key) {
		return new Promise(function (resolve, reject) {
			client.hgetall(key, function (error, object) {
				if (error) {
					console.log(error);
				}
				resolve(object);
			});
		});
	}

	storeList(key, value) {
		value.unshift(key);
		return client.rpush(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getList(key) {
		return new Promise(function (resolve, reject) {
			client.lrange(key, 0, -1, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	async storeSet(key, value) {
		try {
			value.unshift(key);
			const promise = util.promisify(client.sadd).bind(client);
			await promise(value);
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	async removeFromSet(key, value) {
		try {
			const promise = util.promisify(client.srem).bind(client);
			await promise(key, value);
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	getSet(key) {
		return new Promise(function (resolve, reject) {
			client.smembers(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	checkKeyExists(key) {
		return client.exists(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	deleteKey(key) {
		return client.del(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			console.log(reply)
			return reply;
		});
	}

	expireKey(key, expiryTime) {
		// in seconds
		return client.expireAsync(key, expiryTime, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	incrementKey(key, value) {
		// or incrby()
		return client.set(key, 10, function () {
			return client.incr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	decrementKey(key, value) {
		// or decrby()
		return client.set(key, 10, function () {
			return client.decr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	async brpop(key, timeout = 2) {
		try {
			return new Promise((resolve, reject) => {
				client.brpop(key, timeout, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	async addToSortedSet(setname, value, key) {
		try {
			return new Promise((resolve, reject) => {
				client.zadd(setname, value, key, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async getRankFromSortedSet(setname, key) {
		try {
			return new Promise((resolve, reject) => {
				client.zrevrank(setname, key, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async getRankedListFromSortedSet(setName, offset, count) {
		try {
			return new Promise((resolve, reject) => {

				const args2 = [setName, "+inf", "-inf", "WITHSCORES", "LIMIT", offset, count];
				client.zrevrangebyscore(args2, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async sortedListLength(setName) {
		try {
			return new Promise((resolve, reject) => {
				const arg1 = [setName, "-inf", "+inf"];
				client.zcount(arg1, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};
}

export const redisClient = new RedisClient();