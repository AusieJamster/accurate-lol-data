// import type { SendMessageBatchCommandInput } from '@aws-sdk/client-sqs';
// import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
// import custom from '@sls/custom';
// import { getRequestContext } from '@utils/request';
import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'types/lambda.types';

export const handler: APIGatewayProxyHandler = async (): Promise<APIGatewayProxyResult> => {
  // const { isDebug, requestId } = getRequestContext(event);

  try {
    //   // fetch version from riot games
    //   // if we dont have that version in dynamoDB
    //   //  get all champion ids from riot games api
    //   //  throw in to the queue one message per champion id
    //   // if we do have that version in dynamoDB
    //   //  return;

    //   const championIds = ['90'];

    //   const client = new SQSClient(); //config);

    //   const input: SendMessageBatchCommandInput = {
    //     QueueUrl: custom.championImportQueueUrl,
    //     Entries: championIds.map((id) => ({
    //       Id: `${requestId}_${id}`,
    //       MessageBody: JSON.stringify({
    //         isDebug,
    //         requestId,
    //         championId: id
    //       })
    //     }))
    //   };

    //   const command = new SendMessageBatchCommand(input);
    //   const response = await client.send(command);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify('success')
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(err)
    };
  }
};
