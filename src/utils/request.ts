import type { APIGatewayProxyEvent, AwsContext } from 'types/lambda.types';

export const getRequestContext = (event: APIGatewayProxyEvent, context: AwsContext) => ({
  isDebug: !!event.headers?.isDebug,
  requestId: event.headers?.request || context.awsRequestId || 'request-id-fallback'
});
