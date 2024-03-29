import type { AWS } from '@serverless/typescript';
import custom from './sls/custom';
import functions from './sls/functions';
import provider from './sls/provider';
import { iam } from './sls/resources/iam';

const serverlessConfiguration: AWS = {
  service: 'accurate-lol-data',
  plugins: ['serverless-webpack', 'serverless-offline', 'serverless-add-api-key'],
  package: {
    individually: true,
    patterns: []
  },
  useDotenv: true,
  custom,
  provider,
  resources: {
    Resources: iam.Resources
  },
  functions
};

module.exports = serverlessConfiguration;
