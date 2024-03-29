import { default as custom, AWS_ACCOUNT_ID } from '../custom';

export const iam = {
  Resources: {
    IamRoleLambdaExecution: {
      Type: 'AWS::IAM::Role',
      Properties: {
        PermissionsBoundary: `arn:aws:iam::${AWS_ACCOUNT_ID}:policy/accurate_lol_data_boundary`,
        RoleName: '${self:service}-${self:provider.stage}-role'
      }
    },
    ChampionImportQueue: {
      Type: 'AWS::SQS::Queue',
      Properties: {
        QueueName: custom.championImportQueueName,
        VisibilityTimeout: 30000
      }
    },
    ChampionImportQueuePolicy: {
      Type: 'AWS::SQS::QueuePolicy',
      Properties: {
        PolicyDocument: {
          Statement: [
            {
              Effect: 'Allow',
              Action: ['sqs:SendMessage'],
              Resource: [{ 'Fn::GetAtt': ['ChampionImportQueue', 'Arn'] }],
              Principal: '*'
            }
          ]
        },
        Queues: [{ Ref: 'ChampionImportQueue' }]
      }
    }
  }
} as const;
