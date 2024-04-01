import custom from '../custom';

const dynamodb = {
  ChampionsTable: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Delete',
    Properties: {
      TableName: custom.championsTableName,
      AttributeDefinitions: [
        { AttributeName: 'version', AttributeType: 'S' },
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'version', KeyType: 'HASH' },
        { AttributeName: 'id', KeyType: 'RANGE' }
      ],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }
  },
  WikiDataTable: {
    Type: 'AWS::DynamoDB::Table',
    DeletionPolicy: 'Delete',
    Properties: {
      TableName: custom.wikiChampionDataName,
      AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
      ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
    }
  }
} as const;

export default dynamodb;
