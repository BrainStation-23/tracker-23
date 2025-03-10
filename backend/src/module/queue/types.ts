export enum QueuePayloadType {
  SYNC_ALL = 'SYNC_ALL',
  SYNC_PROJECT_OR_OUTLOOK = 'SYNC_PROJECT_OR_OUTLOOK',
  RELOAD = 'RELOAD',
}

export class QueuePayload {
  payloadType: QueuePayloadType;
  token: string;
  projectId?: number;
}
