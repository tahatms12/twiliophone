import { Device, Call } from '@twilio/voice-sdk';
import { TwilioCredentials, CallRecord, MessageRecord, CallStatus } from '../types';

export class TwilioService {
  private device: Device | null = null;
  private currentCall: Call | null = null;
  private credentials: TwilioCredentials;
  private callStatusCallback?: (status: CallStatus) => void;
  private incomingCallCallback?: (call: Call) => void;

  constructor(credentials: TwilioCredentials) {
    this.credentials = credentials;
  }

  async initialize(): Promise<void> {
    try {
      // Get access token from our backend
      const token = await this.getAccessToken();
      
      // Initialize Twilio Device
      this.device = new Device(token, {
        logLevel: 1,
        answerOnBridge: true
      });

      // Set up event listeners
      this.setupDeviceListeners();

      // Wait for device to be ready
      await new Promise<void>((resolve, reject) => {
        this.device!.on('ready', () => {
          console.log('Twilio Device is ready');
          resolve();
        });

        this.device!.on('error', (error) => {
          console.error('Device error:', error);
          reject(error);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          reject(new Error('Device initialization timeout'));
        }, 10000);
      });

    } catch (error) {
      console.error('Failed to initialize Twilio device:', error);
      throw new Error(`Failed to initialize Twilio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await fetch('/api/twilio-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      // Fallback: generate token client-side (less secure, for demo purposes)
      console.warn('Using client-side token generation - not recommended for production');
      return this.generateClientSideToken();
    }
  }

  private generateClientSideToken(): string {
    // This is a simplified token generation for demo purposes
    // In production, always generate tokens server-side
    const identity = `user_${Date.now()}`;
    const payload = {
      iss: this.credentials.accountSid,
      sub: this.credentials.accountSid,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      grants: {
        voice: {
          outgoing: {
            application_sid: 'demo_app_sid'
          },
          incoming: {
            allow: true
          }
        }
      }
    };
    
    // This would normally use proper JWT signing
    return btoa(JSON.stringify(payload));
  }

  private setupDeviceListeners(): void {
    if (!this.device) return;

    this.device.on('ready', () => {
      console.log('Device is ready');
    });

    this.device.on('error', (error) => {
      console.error('Device error:', error);
      this.callStatusCallback?.('failed');
    });

    this.device.on('incoming', (call) => {
      console.log('Incoming call from:', call.parameters.From);
      this.incomingCallCallback?.(call);
    });

    this.device.on('disconnect', () => {
      console.log('Device disconnected');
    });
  }

  async makeCall(phoneNumber: string): Promise<void> {
    if (!this.device) {
      throw new Error('Device not initialized');
    }

    try {
      this.callStatusCallback?.('connecting');
      
      const params = {
        To: phoneNumber,
        From: this.credentials.phoneNumber
      };

      this.currentCall = await this.device.connect(params);
      this.setupCallListeners(this.currentCall);
      
    } catch (error) {
      console.error('Failed to make call:', error);
      this.callStatusCallback?.('failed');
      throw error;
    }
  }

  private setupCallListeners(call: Call): void {
    call.on('accept', () => {
      console.log('Call accepted');
      this.callStatusCallback?.('in-progress');
    });

    call.on('disconnect', () => {
      console.log('Call disconnected');
      this.callStatusCallback?.('ended');
      this.currentCall = null;
    });

    call.on('cancel', () => {
      console.log('Call cancelled');
      this.callStatusCallback?.('ended');
      this.currentCall = null;
    });

    call.on('error', (error) => {
      console.error('Call error:', error);
      this.callStatusCallback?.('failed');
      this.currentCall = null;
    });

    call.on('ringing', () => {
      console.log('Call is ringing');
      this.callStatusCallback?.('ringing');
    });
  }

  async hangup(): Promise<void> {
    if (this.currentCall) {
      this.currentCall.disconnect();
      this.currentCall = null;
      this.callStatusCallback?.('ended');
    }
  }

  async answerCall(): Promise<void> {
    if (this.currentCall) {
      this.currentCall.accept();
    }
  }

  async rejectCall(): Promise<void> {
    if (this.currentCall) {
      this.currentCall.reject();
      this.currentCall = null;
    }
  }

  async sendSMS(to: string, message: string): Promise<MessageRecord> {
    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          from: this.credentials.phoneNumber,
          body: message,
          credentials: this.credentials
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send SMS: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        id: data.sid,
        to,
        from: this.credentials.phoneNumber,
        body: message,
        direction: 'outbound',
        status: data.status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  async getCallHistory(): Promise<CallRecord[]> {
    try {
      const response = await fetch('/api/call-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.credentials),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch call history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.calls || [];
    } catch (error) {
      console.error('Failed to fetch call history:', error);
      return [];
    }
  }

  async getMessageHistory(): Promise<MessageRecord[]> {
    try {
      const response = await fetch('/api/message-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.credentials),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch message history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('Failed to fetch message history:', error);
      return [];
    }
  }

  setCallStatusCallback(callback: (status: CallStatus) => void): void {
    this.callStatusCallback = callback;
  }

  setIncomingCallCallback(callback: (call: Call) => void): void {
    this.incomingCallCallback = callback;
  }

  isReady(): boolean {
    return this.device !== null;
  }

  destroy(): void {
    if (this.currentCall) {
      this.currentCall.disconnect();
    }
    if (this.device) {
      this.device.destroy();
    }
    this.device = null;
    this.currentCall = null;
  }
}