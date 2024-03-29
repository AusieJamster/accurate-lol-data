import type { AWS } from '@serverless/typescript';

type TCors =
  | boolean
  | {
      allowCredentials?: boolean;
      cacheControl?: string;
      headers?: string[];
      maxAge?: number;
      methods?: ('GET' | 'POST' | 'PUT' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'DELETE' | 'ANY')[];
      origin?: string;
      origins?: string[];
    };

const CORS: TCors = {
  origins: ['http://localhost:*', 'http://127.0.0.1:*']
} as const;

const functions: AWS['functions'] = {
  importChampion: {
    handler: 'src/routes/importChampion/importChampionHandler.handler',
    reservedConcurrency: 5,
    events: [
      {
        http: {
          path: 'import/champion',
          method: 'PUT',
          private: true,
          cors: CORS
        }
      },
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['ChampionImportQueue', 'Arn'] }
          // batchSize: 5
        }
      }
    ]
  },
  importChampionTrigger: {
    handler: 'src/routes/importChampionTrigger/importChampionTriggerHandler.handler',
    events: [
      {
        http: {
          path: 'sendImportMessage/champion',
          method: 'PUT',
          private: true,
          cors: CORS
        }
      }
    ]
  }
};

export default functions;
