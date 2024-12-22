"use strict";

import * as authToken from "./authToken";
import * as good from "./good";
import * as request from "./request";
import * as swagger from "./swagger";

export const plugins = [].concat(authToken, good, request, swagger);