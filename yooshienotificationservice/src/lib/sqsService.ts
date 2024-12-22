import { SERVER } from "@config/environment";
import { notificationDaoV1 } from "@modules/notification";
import * as AWS from "aws-sdk";

interface Config {
  region: string;
  queueUrl: string;
}

// Configuration
const config: Config = {
  region: SERVER.S3.AWS_REGION || "us-east-1",
  queueUrl: SERVER.SQS_QUEUE_URL || "https://sqs.us-east-1.amazonaws.com/043210536673/dev-ysh-notifi.fifo",
};

class SqsService {
  private sqs: AWS.SQS;
  private queueUrl: string;

  constructor(config: Config) {
    // Use the default credential provider chain for role-based authentication
    this.sqs = new AWS.SQS({
      region: config.region,
    });
    this.queueUrl = config.queueUrl;
  }

  /**
   * Send a message to the SQS queue
   * @param messageBody - The message payload
   * @param messageGroupId - The message group ID (required for FIFO queues)
   * @returns A promise resolving with the send message result
   */
  async sendMessage(messageBody: unknown, messageGroupId: string): Promise<AWS.SQS.SendMessageResult> {
    const params: AWS.SQS.SendMessageRequest = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody),
      MessageGroupId: messageGroupId,
      MessageDeduplicationId: `${messageGroupId}-${Date.now()}`, 
    };

    try {
      const result = await this.sqs.sendMessage(params).promise();
      console.log("Message sent successfully:", result.MessageId);
      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async pollMessages() {
    while (true) {
      try {
        const params: AWS.SQS.ReceiveMessageRequest = {
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20, // Long polling reduces empty responses
          VisibilityTimeout: 30,
        };
  
        const result = await this.sqs.receiveMessage(params).promise();
  
        if (result.Messages && result.Messages.length > 0) {
          console.log(`Received ${result.Messages.length} message(s).`);
          for (const message of result.Messages) {
            try {
              const body = JSON.parse(message.Body);
              console.log("Processing message:", body);
              const query = body.query;
              const notificationData = body.notificationData;
              await notificationDaoV1.sendBulkNotification(query, notificationData);
              if (message.ReceiptHandle) {
                await this.deleteMessage(message.ReceiptHandle);
              }
            } catch (messageError) {
              console.error("Error processing message:", messageError);
            }
          }
        } else {
          console.log("No messages received. Waiting before next poll...");
          await this.delay(5000); // Add a delay when no messages are received
        }
      } catch (error) {
        console.error("Error polling messages:", error);
        await this.delay(10000); // Backoff delay on errors
      }
    }
  }
  
  /**
   * Simple delay function
   * @param ms - Milliseconds to wait
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Delete a message from the SQS queue
   * @param receiptHandle - The receipt handle of the message to delete
   * @returns A promise resolving with the delete result
   */
  async deleteMessage(receiptHandle: string) {
    const params: AWS.SQS.DeleteMessageRequest = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: receiptHandle,
    };

    try {
      const result = await this.sqs.deleteMessage(params).promise();
      console.log("Message deleted successfully");
      return result;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }
}

const sqsService = new SqsService(config);

export { SqsService, sqsService };