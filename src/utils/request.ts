import type { APIGatewayProxyEvent } from 'types/lambda.types';
import { uuid } from 'uuidv4';

export const getRequestContext = (event: APIGatewayProxyEvent) => ({
  isDebug: !!event.headers?.isDebug,
  requestId: event.headers?.request || uuid()
});
