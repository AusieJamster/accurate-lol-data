export type TSQSChampionImportMessageBody = {
  isDebug?: boolean;
  requestId: string;
  championId: string;
};

interface SQSMessageAttributes {
  [name: string]: {
    stringValue?: string | undefined;
    binaryValue?: string | undefined;
    stringListValues?: string[] | undefined; // Not implemented. Reserved for future use.
    binaryListValues?: string[] | undefined; // Not implemented. Reserved for future use.
    dataType: 'String' | 'Number' | 'Binary' | string;
  };
}

interface SQSRecordAttributes {
  AWSTraceHeader?: string | undefined;
  ApproximateReceiveCount: string;
  SentTimestamp: string;
  SenderId: string;
  ApproximateFirstReceiveTimestamp: string;
  SequenceNumber?: string | undefined;
  MessageGroupId?: string | undefined;
  MessageDeduplicationId?: string | undefined;
  DeadLetterQueueSourceArn?: string | undefined; // Undocumented, but used by AWS to support their re-drive functionality in the console
}

interface SQSRecord {
  messageId: string;
  receiptHandle: string;
  body: string;
  attributes: SQSRecordAttributes;
  messageAttributes: SQSMessageAttributes;
  md5OfBody: string;
  eventSource: string;
  eventSourceARN: string;
  awsRegion: string;
}

export interface ISQSEvent {
  Records: SQSRecord[];
}
