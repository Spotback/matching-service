import { SQSClient } from '@aws-sdk/client-sqs';
import { SendMessageCommand } from '@aws-sdk/client-sqs';

// Set the AWS Region.

class Producer {
	sqsClient: SQSClient;

	constructor() {
		const REGION = 'us-east-1'; //e.g. "us-east-1"
		this.sqsClient = new SQSClient({ region: REGION });
	}

	send = async (message) => {
		// Set the parameters
		const params = {
			// MessageAttributes: {
			//     currentLocation: {
			//         DataType: "String",
			//         StringValue: message.currentLocation,
			//     },
			//     desiredLocation: {
			//         DataType: "String",
			//         StringValue: message.desiredLocation,
			//     },
			//     email: {
			//         DataType: "String",
			//         StringValue: message.email,
			//     },
			// },
			MessageBody: JSON.stringify(message),
			MessageDeduplicationId: message.body.email, // Required for FIFO queues
			MessageGroupId: 'match', // Required for FIFO queues
			QueueUrl: 'https://sqs.us-east-1.amazonaws.com/762500751597/matching_service.fifo', //SQS_QUEUE_URL; e.g., 'https://sqs.REGION.amazonaws.com/ACCOUNT-ID/QUEUE-NAME'
		};
		try {
			const data = await this.sqsClient.send(new SendMessageCommand(params));
			console.log('Success, message sent. MessageID:', data.MessageId);
			return data; // For unit tests.
		} catch (err) {
			console.log('Error', err);
		}
	};
}

export default new Producer();
