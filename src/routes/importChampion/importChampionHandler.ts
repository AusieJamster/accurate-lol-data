import Logger from '@utils/Logger';
import { ISQSEvent, TSQSChampionImportMessageBody } from 'types/sqs.types';

export const handler = async (event: ISQSEvent): Promise<void> => {
  try {
    event = { Records: [] };
    event.Records.forEach((val) => {
      const { isDebug, requestId, championId } = JSON.parse(val.body) as TSQSChampionImportMessageBody;

      const logger = new Logger(isDebug, requestId);

      if (!championId) {
        logger.error('Missing championId in sqs record.', val);
        throw new Error('Missing championId in sqs record.');
      }

      logger.debug('Beginning champion import of', championId);

      // fetchFromWiki(championId);

      logger.debug('Succesfullly imported champion', championId);
    });
  } catch (err) {
    console.error('ERROR: import champion handler', err);
    console.error('ERROR: import champion handler with event', event);
  }
};
