"use strict";

import * as HapiSwagger from "hapi-swagger";
import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";

import { SERVER } from "@config/environment";

// Register Swagger Plugin
export const plugin = {
	name: "swagger-plugin",
	register: async function (server) {
		const swaggerOptions = {
			info: {
				title: "Yooshie API Documentation",
				description: "Yooshie",
				contact: {
					name: "Harshit",
					email: "harshit.singh@appinventiv.com"
				},
				version: "1.0.0"
			},
			tags: [
				{
					name: "notification",
					description: "Operations about notification",

				},
			],
			grouping: "tags",
			schemes: [SERVER.PROTOCOL, 'https'],
			documentationPath: '/notification/documentation',
			jsonPath: '/notification/swagger.json',
			jsonRoutePath: '/notification/swagger.json',
			swaggerUIPath: '/notification/swaggerui/',
			routesBasePath: '/notification/swaggerui/',
			basePath: SERVER.API_BASE_URL,
			consumes: [
				"application/json",
				"application/x-www-form-urlencoded",
				"multipart/form-data"
			],
			produces: [
				"application/json"
			],
			securityDefinitions: {
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header"
				}
			},
			security: [{
				api_key: []
			}]
		};

		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
		]);
	}
};