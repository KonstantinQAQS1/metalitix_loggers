import * as Kinesis from '@aws-sdk/client-kinesis';
import { DataStreamCredentials, XRAnalytics } from '../types';
import { decryptIamCredentials } from '../utils';

export class DataStream {
  private kinesisClient: Kinesis.KinesisClient;
  private readonly sessionId: string;
  private readonly dataStream: string;

  constructor({ sessionId, dataStream, accessKeyId, secretKey, instanceRegion }: DataStreamCredentials) {
    this.sessionId = sessionId;
    this.dataStream = dataStream;
    const awsCredentials = {
      region: instanceRegion,
      credentials: {
        accessKeyId: decryptIamCredentials(accessKeyId),
        secretAccessKey: decryptIamCredentials(secretKey),
      },
    };
    this.kinesisClient = new Kinesis.KinesisClient(awsCredentials);
  }

  public sendData(records: XRAnalytics.Record[]) {
    console.log('poll', records);

    return this.kinesisClient.send(
      new Kinesis.PutRecordsCommand({
        Records: [
          {
            Data: Buffer.from(JSON.stringify(records)),
            PartitionKey: this.sessionId,
          },
        ],
        StreamName: this.dataStream,
      }),
    );
  }
}
