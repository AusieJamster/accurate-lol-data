export const AWS_ACCOUNT_ID = '332660368510' as const;
export const RESOURCE_PREFIX = '${self:service}-${self:provider.stage}' as const;
const CHAMPION_IMPORT_QUEUE_NAME = `${RESOURCE_PREFIX}-championImportQueue` as const;

const custom = {
  frameworkVersion: '3',
  webpack: {
    webpackConfig: 'webpack.config.js',
    packager: 'npm',
    concurrency: 2,
    excludeFiles: 'src/**/*.[test|spec].[t|j]s', // Provide a glob for files to ignore
    includeModules: {
      forceExclude: ['@aws-sdk', 'aws-sdk', 'newrelic']
    }
  },

  championImportQueueName: CHAMPION_IMPORT_QUEUE_NAME,
  championImportQueueUrl: `https://sqs.ap-southeast-2.amazonaws.com/${AWS_ACCOUNT_ID}/${CHAMPION_IMPORT_QUEUE_NAME}`,

  versionsTableName: 'accurate-lol-data-dev-versions',
  championsTableName: 'accurate-lol-data-dev-champions'
};

export default custom;
