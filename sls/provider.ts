import type { AWS } from '@serverless/typescript';
import environment from '../sls/environment';

const provider: AWS['provider'] = {
  name: 'aws',
  stage: "${opt:stage, 'local'}",
  region: 'ap-southeast-2',
  runtime: 'nodejs18.x',
  timeout: 30,
  versionFunctions: false,
  environment,
  iam: {
    role: {
      statements: [
        {
          Effect: 'Allow',
          Action: ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:DeleteItem', 'dynamodb:Query'],
          Resource: [
            { 'Fn::GetAtt': ['VersionsTable', 'Arn'] },
            {
              'Fn::Join': ['/', [{ 'Fn::GetAtt': ['VersionsTable', 'Arn'] }, 'index/*']]
            },
            { 'Fn::GetAtt': ['ChampionsTable', 'Arn'] },
            {
              'Fn::Join': ['/', [{ 'Fn::GetAtt': ['ChampionsTable', 'Arn'] }, 'index/*']]
            }
          ]
        },
        {
          Effect: 'Allow',
          Action: ['lambda:InvokeFunction'],
          Resource: [
            {
              'Fn::Join': [':', ['arn:aws:lambda', { Ref: 'AWS::Region' }, { Ref: 'AWS::AccountId' }, 'function', '*']]
            }
          ]
        }
      ]
    }
  },
  apiGateway: {
    apiKeys: [
      {
        name: 'accurate-lol-data-${self:provider.stage}-api-key'
      }
    ]
  }
};

export default provider;
