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
				description: "Improve Health",
				contact: {
					name: "Harshit",
					email: "harshit.singh@appinventiv.com"
				},
				version: "1.0.0"
			},
			tags: [
				{
					name: "auth",
					description: "Operations about auth",

				},
			],
			grouping: "tags",
			schemes: [SERVER.PROTOCOL, 'https'],
			documentationPath: '/auth/documentation',
			jsonPath: '/auth/swagger.json',
			jsonRoutePath: '/auth/swagger.json',
			swaggerUIPath: '/auth/swaggerui/',
			routesBasePath: '/auth/swaggerui/',
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