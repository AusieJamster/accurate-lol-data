import { DynamoDBClient, GetItemCommand, GetItemInput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type {
  BatchResultErrorEntry,
  SendMessageBatchCommandInput,
  SendMessageBatchCommandOutput,
  SendMessageBatchResultEntry
} from '@aws-sdk/client-sqs';
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import custom from '../../../sls/custom';
import { getRequestContext } from '@utils/request';
import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'types/lambda.types';
import Logger from '@src/utils/Logger';

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  const { isDebug, requestId } = getRequestContext(event);
  const logger = new Logger(isDebug, requestId);

  try {
    const versionsResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = (await versionsResponse.json()) as string[];
    const latestVersion = versions.shift();
    if (!latestVersion) throw new Error('call to riot games api for versions failed.');

    const dynamoClient = new DynamoDBClient();
    const dynamoInput: GetItemInput = {
      TableName: custom.versionsTableName,
      Key: marshall({ version: latestVersion })
    };
    const dynamoCommand = new GetItemCommand(dynamoInput);
    const dynamoResponse = await dynamoClient.send(dynamoCommand);

    if (dynamoResponse.Item !== undefined) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('version already exists')
      };
    }

    const championsResponse = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`
    );
    const champions = (await championsResponse.json()) as IAllChampionsResponse;
    // (Object.values(champions.data).map((champ) => champ.key))
    const championIds = ['90'].map((id) => ({
      Id: `${requestId}_${id}`,
      MessageBody: JSON.stringify({
        isDebug,
        requestId,
        championId: id
      })
    }));

    const sqsClient = new SQSClient();
    const successfulOutput: SendMessageBatchResultEntry[] = [];
    const failedOutput: BatchResultErrorEntry[] = [];
    let response: SendMessageBatchCommandOutput | null = null;

    do {
      const sqsInput: SendMessageBatchCommandInput = {
        QueueUrl: custom.championImportQueueUrl,
        Entries: championIds.splice(0, 10)
      };
      const command = new SendMessageBatchCommand(sqsInput);
      response = await sqsClient.send(command);

      failedOutput.push(...(response.Failed || []));
      successfulOutput.push(...(response.Successful || []));
    } while (championIds.length > 0);

    logger.debug(failedOutput);

    failedOutput.forEach(logger.error);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isDebug,
        requestId,
        championsFound: Object.values(champions.data).length,
        messagesSent: successfulOutput.length
      })
    };
  } catch (err) {
    logger.error(err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(err)
    };
  }
};
