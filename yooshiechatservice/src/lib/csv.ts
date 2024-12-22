"use strict";

import * as csvtojson from "csvtojson";
import * as fs from "fs";

import { deleteFiles, excelFilter, getDynamicName } from "@utils/appUtils";
import { SERVER } from "@config/environment";

export const readAndParseCSV = function (file) {
	return new Promise(function (resolve, reject) {
		if (excelFilter(file.hapi.filename)) {
			const fileName = getDynamicName(file);
			const filePath = `${SERVER.UPLOAD_DIR}${fileName}`;
			const r = file.pipe(fs.createWriteStream(filePath));
			r.on("close", function () {
				csvtojson()
					.fromFile(filePath)
					.then((jsonObject) => {
						deleteFiles(filePath);
						resolve(jsonObject);
					});
			});
		} else {
			reject(new Error("Invalid file type!"));
		}
	});
};