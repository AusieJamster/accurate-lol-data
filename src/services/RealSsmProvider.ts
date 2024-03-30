import type { SsmProvider } from './SsmProvider';

import type { GetParameterRequest } from '@aws-sdk/client-ssm';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

export default class RealSsmProvider implements SsmProvider {
  async getParameterFromSsm(path: string, withDecryption: boolean): Promise<string | null> {
    const client = new SSMClient();

    const input: GetParameterRequest = {
      Name: path,
      WithDecryption: withDecryption
    };

    const command = new GetParameterCommand(input);
    const response = await client.send(command);

    return response.Parameter?.Value || null;
  }
}
