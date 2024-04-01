import { Champion } from '@src/services/Champion';
import Logger from '@utils/Logger';
import type { ISQSEvent, TSQSChampionImportMessageBody } from 'types/sqs.types';

export const handler = async (event: ISQSEvent): Promise<void> => {
  console.debug('DEBUG: Event', event);

  if (!Array.isArray(event.Records)) throw Error('invalid event, records is not an array');
  try {
    for (let i = 0; i < event.Records.length; i++) {
      const { isDebug, requestId, championId, championKey, version } = JSON.parse(
        event.Records[i].body
      ) as TSQSChampionImportMessageBody;

      const logger = new Logger(isDebug, requestId);

      if (!championId) {
        logger.error('Missing championId in sqs record.', event.Records[i].body);
        throw new Error('Missing championId in sqs record.');
      }

      logger.debug('Beginning champion import of', championId, championKey);

      const champion = new Champion(version, championId, championKey, logger);
      const finalChamp = await champion.getFinalChampion();
      await champion.putDynamoDocument(version, finalChamp);

      logger.debug('Succesfullly imported champion', championId, championKey);
    }
  } catch (err) {
    console.error('ERROR: import champion handler', err);
    console.error('ERROR: import champion handler with event', event);
  }
};
