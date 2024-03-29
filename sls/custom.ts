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

  championImportQueueName: 'accurate-lol-data-dev-championImportQueue',
  championImportQueueUrl:
    'https://sqs.ap-southeast-2.amazonaws.com/332660368510/accurate-lol-data-dev-championImportQueue',

  versionsTableName: 'accurate-lol-data-dev-versions',
  championsTableName: 'accurate-lol-data-dev-champions'
};

export default custom;
