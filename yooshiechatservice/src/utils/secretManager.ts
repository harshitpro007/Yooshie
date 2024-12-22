import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { SERVER } from "@config/environment";
import { ENVIRONMENT } from "@config/index";

export const fetchSecrets = async () => {
  //NOSONAR
  let NODE_ENV = process.env.NODE_ENV.trim();
  let secretName = null;

  if (NODE_ENV != ENVIRONMENT.LOCAL) {
    if (NODE_ENV == ENVIRONMENT.DEV) secretName = SERVER.DEV_SECRET_NAME;
    if (NODE_ENV == ENVIRONMENT.QA) secretName = SERVER.QA_SECRET_NAME;
    if (NODE_ENV == ENVIRONMENT.STAGE) secretName = SERVER.STAGE_SECRET_NAME;

    let client: any = {};
    client = new SecretsManagerClient({
      region: SERVER.S3.AWS_REGION,
    });
    try {
      const response = await client.send(
        new GetSecretValueCommand({
          SecretId: secretName,
        })
      );
      let secrets = JSON.parse(response.SecretString);
      for (const envKey of Object.keys(secrets)) {
        process.env[envKey] = secrets[envKey];
        SERVER[envKey] = secrets[envKey];
      }
      return true;
    } catch (error) {
      throw error;
    }
  } else {
    return true;
  }
};
