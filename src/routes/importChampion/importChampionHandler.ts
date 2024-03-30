import { Champion } from '@src/services/Champion';
import Logger from '@utils/Logger';
import type { ISQSEvent, TSQSChampionImportMessageBody } from 'types/sqs.types';

export const handler = async (event: ISQSEvent): Promise<void> => {
  try {
    event.Records.forEach(async (val) => {
      const { isDebug, requestId, championId, championKey, version } = JSON.parse(
        val.body
      ) as TSQSChampionImportMessageBody;

      const logger = new Logger(isDebug, requestId);

      if (!championId) {
        logger.error('Missing championId in sqs record.', val);
        throw new Error('Missing championId in sqs record.');
      }

      logger.debug('Beginning champion import of', championId, championKey);

      const champion = new Champion(version, championId, championKey);
      const finalChamp = await champion.merge();
      await champion.putDynamoDocument(finalChamp);

      logger.debug('Succesfullly imported champion', championId, championKey);
    });
  } catch (err) {
    console.error('ERROR: import champion handler', err);
    console.error('ERROR: import champion handler with event', event);
  }
};
