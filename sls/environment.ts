import type { AWS } from '@serverless/typescript';

const environment: AWS['provider']['environment'] = {
  STAGE: '${self:provider.stage}',
  OPENAI_API_KEY: '${ssm:/accurate-lol-data/gpt/api-key}'
};

export default environment;
