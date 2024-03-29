export const AWS_ACCOUNT_ID = '332660368510' as const;
const CHAMPION_IMPORT_QUEUE_NAME = '${self:service}-championImportQueue-${self:provider.stage}' as const;

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
  championImportQueueUrl: `https://sqs.ap-southeast-2.amazonaws.com/${AWS_ACCOUNT_ID}/${CHAMPION_IMPORT_QUEUE_NAME}`
} as const;

export default custom;
