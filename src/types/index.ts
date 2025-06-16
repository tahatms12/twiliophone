export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export interface CallRecord {
  id: string;
  to: string;
  from: string;
  status: string;
  direction: 'inbound' | 'outbound';
  duration?: number;
  timestamp: Date;
}

export interface MessageRecord {
  id: string;
  to: string;
  from: string;
  body: string;
  direction: 'inbound' | 'outbound';
  status: string;
  timestamp: Date;
}

export type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'ended' | 'failed';