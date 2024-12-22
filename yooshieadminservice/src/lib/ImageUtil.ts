"use strict";

import * as AWS from "aws-sdk";
import * as	fs from "fs";
import * as path from "path";

import * as appUtils from "@utils/appUtils";
import { fileUploadExts, SERVER } from "@config/index";
import { audio, image, video } from "@json/mime-type.json";

export class ImageUtil {

	// constructor() {
		// const ENVIRONMENT = process.env.NODE_ENV.trim();
		// const ENVIRONMENT2=["dev","qa"]
		// if(ENVIRONMENT2.includes(ENVIRONMENT)) {
		// AWS.config.update({
		// 	accessKeyId: SERVER.S3.FILE_ACCESS_KEY_ID,
		// 	secretAccessKey: SERVER.S3.FILE_SECRET_ACCESS_KEY
		// });
	// }
	// }

	private filters(file) {
		const mimetypes = [
			video.filter(v => v.extension === ".mp4")[0].mimetype,
			video.filter(v => v.extension === ".flv")[0].mimetype,
			video.filter(v => v.extension === ".mov")[0].mimetype,
			video.filter(v => v.extension === ".avi")[0].mimetype,
			video.filter(v => v.extension === ".wmv")[0].mimetype,

			image.filter(v => v.extension === ".jpg")[0].mimetype,
			image.filter(v => v.extension === ".jpeg")[0].mimetype,
			image.filter(v => v.extension === ".png")[0].mimetype,
			image.filter(v => v.extension === ".jpg")[0].mimetype,
			image.filter(v => v.extension === ".svg")[0].mimetype,

			audio.filter(v => v.extension === ".mp3")[0].mimetype,
			audio.filter(v => v.extension === ".aac")[0].mimetype,
			audio.filter(v => v.extension === ".aiff")[0].mimetype,
			audio.filter(v => v.extension === ".m4a")[0].mimetype,
			audio.filter(v => v.extension === ".ogg")[0].mimetype,
		];

		if (
			fileUploadExts.indexOf(path.extname(file.hapi.filename.toLowerCase())) !== -1 &&
			mimetypes.indexOf(file.hapi.headers["content-type"]) !== -1
		) {
			return true;
		}
		return false;
	}

	/**
	 * @function uploadImage This Function is used to uploading image to S3 Server
	 */
	private _uploadToS3(fileName, fileBuffer, contentType) {
		try { // NOSONAR
			return new Promise((resolve, reject) => {
				const s3 = new AWS.S3();
				s3.upload({
					Key: 'exportFiles/'+String(fileName),
					Body: fileBuffer,
					ContentType: contentType,
					Bucket: SERVER.S3.S3_FILE_BUCKET_NAME,
				}, (error, data) => {
					if (error) {
						console.log("Upload failed: ", error);
						reject(error); // NOSONAR
					} else
						resolve(data);
				});
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function uploadSingleMediaToS3 This Function is used to upload single image to S3 Server
	 */
	uploadSingleMediaToS3(file) {
		return new Promise((resolve, reject) => {
			if (file) {
				const filePath = `${SERVER.UPLOAD_DIR}${file}`;
				console.log("filePath==========>", filePath);

					fs.readFile(filePath, (error, fileBuffer) => {
						if (error) reject(error);
						this._uploadToS3(file, fileBuffer, "text/csv")
							.then((data: any) => {
								appUtils.deleteFiles(filePath);
								const location = `${SERVER.S3.FILE_BUCKET_URL}exportFiles/${file}`
								resolve(location);
							})
							.catch((error) => {
								reject(error); // NOSONAR
							});
					});
				// });
			} else {
				reject(new Error("Invalid file type!"));
			}
		});
	}

	deleteFromS3(filename) {
		filename = filename.split("/").slice(-1)[0];
		const s3 = new AWS.S3({
			params: { Bucket: SERVER.S3.FILE_BUCKET_URL }
		});
		return new Promise(function (resolve, reject) {
			const params = {
				Bucket: SERVER.S3.FILE_BUCKET_URL,
				Key: filename
			};

			s3.deleteObject(params, function (error, data) {
				console.log(error, data);
				if (error) {
					reject(error);
				} else {
					resolve(data);
				}
			});
		});
	}
}

export const imageUtil = new ImageUtil();