type Callback<TResult = any> = (error?: Error | string | null, result?: TResult) => void;

export interface AwsContext {
  callbackWaitsForEmptyEventLoop: boolean;
  functionName: string;
  functionVersion: string;
  invokedFunctionArn: string;
  memoryLimitInMB: string;
  awsRequestId: string;
  logGroupName: string;
  logStreamName: string;
  identity?: unknown;
  clientContext?: unknown;

  getRemainingTimeInMillis(): number;

  // Functions for compatibility with earlier Node.js Runtime v0.10.42
  // No longer documented, so they are deprecated, but they still work
  // as of the 12.x runtime, so they are not removed from the types.

  /** @deprecated Use handler callback or promise result */
  done(error?: Error, result?: any): void;
  /** @deprecated Use handler callback with first argument or reject a promise result */
  fail(error: Error | string): void;
  /** @deprecated Use handler callback with second argument or resolve a promise result */
  succeed(messageOrObject: any): void;
  // Unclear what behavior this is supposed to have, I couldn't find any still extant reference,
  // and it behaves like the above, ignoring the object parameter.
  /** @deprecated Use handler callback or promise result */
  succeed(message: string, object: any): void;
}

type Handler<TEvent = any, TResult = any> = (
  event: TEvent,
  context: AwsContext,
  callback: Callback<TResult>
) => void | Promise<TResult>;

interface APIGatewayProxyEventBase<TAuthorizerContext> {
  body: string | null;
  headers: Record<string, string | undefined>;
  multiValueHeaders: Record<string, string[] | undefined>;
  httpMethod: string;
  isBase64Encoded: boolean;
  path: string;
  pathParameters: Record<string, string | undefined> | null;
  queryStringParameters: Record<string, string | undefined> | null;
  multiValueQueryStringParameters: Record<string, string[] | undefined> | null;
  stageVariables: Record<string, string | undefined> | null;
  requestContext: APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext>;
  resource: string;
}

interface APIGatewayEventClientCertificate {
  clientCertPem: string;
  serialNumber: string;
  subjectDN: string;
  issuerDN: string;
  validity: {
    notAfter: string;
    notBefore: string;
  };
}

interface APIGatewayEventIdentity {
  accessKey: string | null;
  accountId: string | null;
  apiKey: string | null;
  apiKeyId: string | null;
  caller: string | null;
  clientCert: APIGatewayEventClientCertificate | null;
  cognitoAuthenticationProvider: string | null;
  cognitoAuthenticationType: string | null;
  cognitoIdentityId: string | null;
  cognitoIdentityPoolId: string | null;
  principalOrgId: string | null;
  sourceIp: string;
  user: string | null;
  userAgent: string | null;
  userArn: string | null;
}

interface APIGatewayEventRequestContextWithAuthorizer<TAuthorizerContext> {
  accountId: string;
  apiId: string;
  // This one is a bit confusing: it is not actually present in authorizer calls
  // and proxy calls without an authorizer. We model this by allowing undefined in the type,
  // since it ends up the same and avoids breaking users that are testing the property.
  // This lets us allow parameterizing the authorizer for proxy events that know what authorizer
  // context values they have.
  authorizer: TAuthorizerContext;
  connectedAt?: number | undefined;
  connectionId?: string | undefined;
  domainName?: string | undefined;
  domainPrefix?: string | undefined;
  eventType?: string | undefined;
  extendedRequestId?: string | undefined;
  protocol: string;
  httpMethod: string;
  identity: APIGatewayEventIdentity;
  messageDirection?: string | undefined;
  messageId?: string | null | undefined;
  path: string;
  stage: string;
  requestId: string;
  requestTime?: string | undefined;
  requestTimeEpoch: number;
  resourceId: string;
  resourcePath: string;
  routeKey?: string | undefined;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  headers?:
    | {
        [header: string]: boolean | number | string;
      }
    | undefined;
  multiValueHeaders?:
    | {
        [header: string]: Array<boolean | number | string>;
      }
    | undefined;
  body: string;
  isBase64Encoded?: boolean | undefined;
}

type APIGatewayEventDefaultAuthorizerContext =
  | undefined
  | null
  | {
      [name: string]: any;
    };

export type APIGatewayProxyEvent = APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>;

export type APIGatewayProxyHandler = Handler<APIGatewayProxyEvent, APIGatewayProxyResult>;
