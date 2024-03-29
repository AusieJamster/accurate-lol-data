import { AWS } from '@serverless/typescript';

const environment: AWS['provider']['environment'] = {
  STAGE: '${self:provider.stage}'
};

export default environment;
