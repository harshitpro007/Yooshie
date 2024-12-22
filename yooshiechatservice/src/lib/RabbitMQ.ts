"use strict";

const amqp = require("amqplib/callback_api");

import {  toObjectId } from "@utils/appUtils";
import { logger } from "@lib/index";
import {
	QUEUE_NAME,
	SERVER
} from "@config/index";
let amqpConn = null;
let offlinePubQueue = [];
let pubChannel = null;
const exchange = SERVER.IS_RABBITMQ_DELAYED_ENABLE ? "my-delay-exchange" : "";
const queueName = SERVER.RABBITMQ.QUEUE_NAME;

export class RabbitMQ {

	// if the connection is closed or fails to be established at all, we will reconnect
	init() {
		amqp.connect(SERVER.RABBITMQ.URL + "?heartbeat=60", (error, connection) => {
			if (error) {
				console.error("[AMQP]", error.message);
				logger.error("Error in [AMQP] ===>>", error.message);
				return setTimeout(() => this.init(), 1000);
			}
			connection.on("error", function (error) {
				if (error.message !== "Connection closing") {
					console.error("[AMQP] conn error", error.message);
				}
			});
			connection.on("close", () => {
				console.error("[AMQP] reconnecting");
				return setTimeout(() => this.init(), 1000);
			});

			console.log("[AMQP] connected");
			logger.info(`[AMQP] connected ==========>>>${SERVER.RABBITMQ.URL}`);
			amqpConn = connection;

			this.startPublisher();
		});
	}

	closeOnError(error) {
		if (!error) return false;
		console.error("[AMQP] error", error);
		amqpConn.close();
		return true;
	}

	// Publisher
	startPublisher() {
		amqpConn.createConfirmChannel((error, channel) => {
			if (this.closeOnError(error)) return;
			channel.on("error", function (error) {
				console.error("[AMQP] channel error", error.message);
			});
			channel.on("close", function () {
				console.log("[AMQP] channel closed");
			});

			pubChannel = channel;

			if (SERVER.IS_RABBITMQ_DELAYED_ENABLE) {
				// assert the exchange: 'my-delay-exchange' to be a x - delayed - message,
				pubChannel.assertExchange(exchange, "x-delayed-message", { autoDelete: false, durable: true, passive: true, arguments: { "x-delayed-type": "direct" } });
				// Bind the queue: "jobs" to the exchnage: "my-delay-exchange" with the binding key "jobs"
				pubChannel.bindQueue(queueName, exchange, queueName);
			}

			channel.assertQueue(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_IOS, {
				durable: true
			});
			channel.assertQueue(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_ANDROID, {
				durable: true
			});
			channel.assertQueue(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_WEB, {
				durable: true
			});
			channel.assertQueue(queueName + QUEUE_NAME.DATABASE_INSERT, {
				durable: true
			});
			channel.assertQueue(queueName, {
				durable: true
			});
			this.startConsumer();
			channel.prefetch(1);

			while (true) {
				var m = offlinePubQueue.shift();
				if (!m) break;
				this._publish(m[0], m[1], m[2]);
			}
		});
	}

	// method to publish a message, will queue messages internally if the connection is down and resend later
	_publish(routingKey, content, delay = 0) {
		try {
			let headers = {};
			if (SERVER.IS_RABBITMQ_DELAYED_ENABLE) {
				headers = { headers: { "x-delay": delay }, persistent: true }
			} else {
				headers = { persistent: true };
			}
			pubChannel.publish(exchange, routingKey, content, headers, function (error, ok) {
				if (error) {
					console.error("[AMQP] publish", error);
					offlinePubQueue.push([exchange, routingKey, content]);
					pubChannel.connection.close();
				}
			});
		} catch (error) {
			console.error("[AMQP] failed", error.message);
			offlinePubQueue.push([exchange, routingKey, content]);
		}
	}

	// A consumer that acks messages only if processed succesfully
	startConsumer() {
		amqpConn.createChannel((error, channel) => {
			if (this.closeOnError(error)) return;
			channel.on("error", function (error) {
				console.error("[AMQP] channel error", error.message);
			});
			channel.on("close", function () {
				console.log("[AMQP] channel closed");
			});

			channel.consume(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_IOS, async (message) => {
				try {
					const { deviceIds, deviceType, payload } = JSON.parse(message.content.toString());
					channel.ack(message);
				} catch (error) {
					this.closeOnError(error);
				}
			}, { noAck: false });

			channel.consume(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_ANDROID, async (message) => {
				try {
					const { deviceIds, deviceType, payload } = JSON.parse(message.content.toString());
					channel.ack(message);
				} catch (error) {
					this.closeOnError(error);
				}
			},
				{ noAck: false });

			channel.consume(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_WEB, async (message) => {
				try {
					const { deviceIds, deviceType, payload } = JSON.parse(message.content.toString());
					channel.ack(message);
				} catch (error) {
					this.closeOnError(error);
				}
			},
				{ noAck: false });

			channel.consume(queueName + QUEUE_NAME.DATABASE_INSERT, async (message) => {
				try {
					const payload = JSON.parse(message.content.toString());
					for (const obj of payload) {
						obj["receiverId"] = obj["receiverId"].map(v => toObjectId(v));
						if (obj["senderId"]) obj["senderId"] = toObjectId(obj["senderId"]);
						if (obj["activityId"] && obj['activityId'] !== undefined) obj["activityId"] = toObjectId(obj["activityId"]);
						if (obj["requestId"]) obj["requestId"] = toObjectId(obj["requestId"]);
						if (obj["notesId"]) obj["notesId"] = toObjectId(obj["notesId"]);
						if (obj["message"]) obj["message"] = obj["message"];
						if (obj["category"]) obj["category"] = obj["category"];
						if (obj["activityName"]) obj["activityName"] = obj["activityName"];
						if (obj["activityType"]) obj["activityType"] = obj["activityType"];
						obj["isRead"] = false;
						obj["created"] = Date.now();
						obj["createdAt"] = new Date(obj["createdAt"]);
						obj["updatedAt"] = new Date(obj["updatedAt"]);
					}
					channel.ack(message);
				} catch (error) {
					this.closeOnError(error);
				}
			}, { noAck: false });

			channel.consume(queueName, processMsg, { noAck: false });

			function processMsg(message) {
				listenJobs(message, (ok) => {
					try {
						if (ok)
							channel.ack(message);
						else
							channel.reject(message, true);
					} catch (error) {
						this.closeOnError(error);
					}
				});
			}

			const listenJobs = async (msg, callback) => {
				msg = JSON.parse(msg.content.toString());
				const jobName = msg.queueName;
				const data = msg.data;
				callback(true);
			}
		});
	}

	current_time() {
		let now = new Date();
		let hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
		let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
		let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
		return hour + ":" + minute + ":" + second;
	}

	delayedQueues() {
		console.log("delayedQueues===============>");
		const msg = JSON.stringify({ "queueName": QUEUE_NAME.DELAY_NON_DELAY, "data": "work sent: " + this.current_time() });
		this._publish(queueName, Buffer.from(msg), 10000);
	}

	nonDelayedQueues() {
		console.log("nonDelayedQueues===============>");
		const msg = JSON.stringify({ "queueName": QUEUE_NAME.DELAY_NON_DELAY, "data": "work sent: " + this.current_time() });
		this._publish(queueName, Buffer.from(msg), 0);
	}

	oneToOne(data, delayTime = 0) {
		const msg = JSON.stringify(data);
		this._publish(queueName, Buffer.from(msg), delayTime);
	}

	pushNotificationIOS(data) {
		const msg = JSON.stringify(data);
		this._publish(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_IOS, Buffer.from(msg));
	}

	pushNotificationAndroid(data) {
		const msg = JSON.stringify(data);
		this._publish(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_ANDROID, Buffer.from(msg));
	}

	pushNotificationWeb(data) {
		const msg = JSON.stringify(data);
		this._publish(queueName + QUEUE_NAME.PUSH_NOTIFIACTION_WEB, Buffer.from(msg));
	}

	databaseInsertion(data) {
		const msg = JSON.stringify(data);
		this._publish(queueName + QUEUE_NAME.DATABASE_INSERT, Buffer.from(msg));
	}
}

 export const rabbitMQ = new RabbitMQ();