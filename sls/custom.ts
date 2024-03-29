export const AWS_ACCOUNT_ID = '332660368510' as const;
const CHAMPION_IMPORT_QUEUE_NAME = '${self:service}-championImportQueue-${self:provider.stage}' as const;

const custom = {
  frameworkVersion: '3',
  championImportQueueName: CHAMPION_IMPORT_QUEUE_NAME,
  championImportQueueUrl: `https://sqs.ap-southeast-2.amazonaws.com/${AWS_ACCOUNT_ID}/${CHAMPION_IMPORT_QUEUE_NAME}`
} as const;

export default custom;
