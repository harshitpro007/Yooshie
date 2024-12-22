"use strict";

const winston = require('winston');
require('winston-daily-rotate-file');

const appRoot = process.cwd();
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	verbose: 3,
	debug: 4,
	silly: 5,
	cron: 6,
	health: 7,
	moengage: 8
};

const options = {
	info: new (winston.transports.DailyRotateFile)({
		level: "info",
		filename: `${appRoot}/logs/info-%DATE%.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		handleExceptions: true,
		json: true,
		maxsize: "5m", // 5MB
		maxFiles: 5,
		colorize: false
	}),
	error: new (winston.transports.DailyRotateFile)({
		level: "error",
		filename: `${appRoot}/logs/error-%DATE%.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		handleExceptions: true,
		json: true,
		maxsize: "5m", // 5MB
		maxFiles: 5,
		colorize: false
	}),
	health: new (winston.transports.DailyRotateFile)({
		level: "health",
		filename: `${appRoot}/logs/health-%DATE%.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		handleExceptions: true,
		json: true,
		maxsize: "5m", // 5MB
		maxFiles: 5,
		colorize: false
	}),
	cron: new (winston.transports.DailyRotateFile)({
		level: "cron",
		filename: `${appRoot}/logs/cron-%DATE%.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		handleExceptions: true,
		json: true,
		maxsize: "5m", // 5MB
		maxFiles: 5,
		colorize: false
	}),
	moengage: new (winston.transports.DailyRotateFile)({
		level: "moengage",
		filename: `${appRoot}/logs/moengage-%DATE%.log`,
		datePattern: 'YYYY-MM-DD',
		zippedArchive: true,
		handleExceptions: true,
		json: true,
		maxsize: "5m", // 5MB
		maxFiles: 5,
		colorize: false
	}),
	console: {
		level: "debug",
		handleExceptions: true,
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple())
	}
};

export const logger = winston.createLogger({
	levels,
	transports: [
		new winston.transports.Console(options.console),
		options.info,
		options.error,
		options.health,
		options.cron,
		options.moengage
	],
	exitOnError: false
});