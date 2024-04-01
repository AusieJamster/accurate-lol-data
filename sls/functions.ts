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
    timeout: 900,
    events: [
      {
        sqs: {
          arn: { 'Fn::GetAtt': ['ChampionImportQueue', 'Arn'] }
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
      // { schedule: 'rate(30 minute)' }
    ]
  }
};

export default functions;
