import type { GetItemInput } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
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
import type { RiotGamesAllChampionsResponse } from 'types/ddragon.types';
import axios from 'axios';

export const handler: APIGatewayProxyHandler = async (event, context): Promise<APIGatewayProxyResult> => {
  console.log('DEBUG: ', event, context);
  const { isDebug, requestId } = getRequestContext(event, context);
  const logger = new Logger(isDebug, requestId);

  logger.debug('Running handler...');

  try {
    const versionsResponse = await axios.get<string[]>('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = versionsResponse.data;
    logger.debug('versions response', versions);
    const latestVersion = versions.shift();
    if (!latestVersion) throw new Error('call to riot games api for versions failed.');
    logger.debug('latestVersion', latestVersion);

    const dynamoClient = new DynamoDBClient({ logger });
    const dynamoInput: GetItemInput = {
      TableName: custom.championsTableName,
      Key: marshall({ version: latestVersion, id: '90' })
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
    const champions = (await championsResponse.json()) as RiotGamesAllChampionsResponse;
    const prepedMessages = Object.values(champions.data)
      .map((champ) => ({ key: champ.key, id: champ.id }))
      .map(({ key, id }) => ({
        Id: `${requestId}_${id}`,
        MessageBody: JSON.stringify({
          isDebug,
          requestId,
          version: latestVersion,
          championId: id,
          championKey: key
        })
      }));

    const sqsClient = new SQSClient({ logger });
    const successfulOutput: SendMessageBatchResultEntry[] = [];
    const failedOutput: BatchResultErrorEntry[] = [];
    let response: SendMessageBatchCommandOutput | null = null;

    do {
      const sqsInput: SendMessageBatchCommandInput = {
        QueueUrl: custom.championImportQueueUrl,
        Entries: prepedMessages.splice(0, 10)
      };
      const command = new SendMessageBatchCommand(sqsInput);
      response = await sqsClient.send(command);

      failedOutput.push(...(response.Failed || []));
      successfulOutput.push(...(response.Successful || []));
    } while (prepedMessages.length > 0);

    logger.debug('failedOutput', failedOutput);

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
