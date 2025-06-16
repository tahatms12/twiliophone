import React, { useState, useEffect } from 'react';
import { TwilioService } from '../services/TwilioService';
import { CallStatus, CallRecord, MessageRecord } from '../types';
import { Call } from '@twilio/voice-sdk';

interface PhoneInterfaceProps {
  twilioService: TwilioService;
  isConnected: boolean;
}

const PhoneInterface: React.FC<PhoneInterfaceProps> = ({ twilioService, isConnected }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [smsMessage, setSmsMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'dialer' | 'sms' | 'history'>('dialer');
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [messageHistory, setMessageHistory] = useState<MessageRecord[]>([]);
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (twilioService) {
      twilioService.setCallStatusCallback(setCallStatus);
      twilioService.setIncomingCallCallback(handleIncomingCall);
      loadHistory();
    }
  }, [twilioService]);

  const loadHistory = async () => {
    try {
      const [calls, messages] = await Promise.all([
        twilioService.getCallHistory(),
        twilioService.getMessageHistory()
      ]);
      setCallHistory(calls);
      setMessageHistory(messages);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleIncomingCall = (call: Call) => {
    setIncomingCall(call);
    setCallStatus('ringing');
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handleNumberInput = (digit: string) => {
    if (phoneNumber.replace(/[^\d]/g, '').length < 10) {
      setPhoneNumber(formatPhoneNumber(phoneNumber + digit));
    }
  };

  const handleCall = async () => {
    if (!isConnected || !phoneNumber) return;

    try {
      setError(null);
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      await twilioService.makeCall(`+1${cleanNumber}`);
      await loadHistory();
    } catch (error) {
      console.error('Call failed:', error);
      setError(error instanceof Error ? error.message : 'Call failed');
      setCallStatus('failed');
    }
  };

  const handleHangup = async () => {
    try {
      await twilioService.hangup();
      setIncomingCall(null);
    } catch (error) {
      console.error('Hangup failed:', error);
    }
  };

  const handleAnswerCall = async () => {
    try {
      await twilioService.answerCall();
      setIncomingCall(null);
    } catch (error) {
      console.error('Failed to answer call:', error);
    }
  };

  const handleRejectCall = async () => {
    try {
      await twilioService.rejectCall();
      setIncomingCall(null);
      setCallStatus('idle');
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
  };

  const handleSendSMS = async () => {
    if (!isConnected || !phoneNumber || !smsMessage.trim()) return;

    try {
      setError(null);
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      const messageRecord = await twilioService.sendSMS(`+1${cleanNumber}`, smsMessage);
      
      setMessageHistory(prev => [messageRecord, ...prev]);
      setSmsMessage('');
      await loadHistory();
    } catch (error) {
      console.error('SMS failed:', error);
      setError(error instanceof Error ? error.message : 'SMS failed');
    }
  };

  const handleClear = () => {
    setPhoneNumber('');
    setError(null);
  };

  const handleBackspace = () => {
    const digits = phoneNumber.replace(/[^\d]/g, '');
    const newDigits = digits.slice(0, -1);
    setPhoneNumber(formatPhoneNumber(newDigits));
  };

  const keypadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#']
  ];

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'connecting': return 'text-yellow-400';
      case 'ringing': return 'text-blue-400';
      case 'in-progress': return 'text-green-400';
      case 'ended': return 'text-gray-400';
      case 'failed': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusText = (status: CallStatus) => {
    switch (status) {
      case 'connecting': return 'Connecting...';
      case 'ringing': return 'Ringing...';
      case 'in-progress': return 'Call in progress';
      case 'ended': return 'Call ended';
      case 'failed': return 'Call failed';
      default: return '';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-white text-xl font-semibold mb-2">Incoming Call</h3>
            <p className="text-white/80 mb-6">From: {incomingCall.parameters.From}</p>
            <div className="flex space-x-4">
              <button
                onClick={handleAnswerCall}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Answer
              </button>
              <button
                onClick={handleRejectCall}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        {/* Tab Navigation */}
        <div className="flex mb-6 bg-white/10 rounded-lg p-1">
          {[
            { key: 'dialer', label: 'Dialer', icon: '📞' },
            { key: 'sms', label: 'SMS', icon: '💬' },
            { key: 'history', label: 'History', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Dialer Tab */}
        {activeTab === 'dialer' && (
          <>
            {/* Display */}
            <div className="bg-black/20 rounded-lg p-4 mb-6 text-center">
              <div className="text-white text-2xl font-mono mb-2 min-h-[2rem]">
                {phoneNumber || 'Enter number'}
              </div>
              {callStatus !== 'idle' && (
                <div className={`text-sm ${getStatusColor(callStatus)}`}>
                  {getStatusText(callStatus)}
                </div>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {keypadButtons.flat().map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleNumberInput(digit)}
                  disabled={callStatus === 'in-progress'}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-semibold h-14 rounded-lg transition-all duration-200 active:scale-95"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 mb-4">
              <button
                onClick={handleClear}
                disabled={callStatus === 'in-progress'}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleBackspace}
                disabled={callStatus === 'in-progress'}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
              >
                ⌫
              </button>
            </div>

            {/* Call Button */}
            <div className="flex space-x-3">
              {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'failed' ? (
                <button
                  onClick={handleCall}
                  disabled={!isConnected || !phoneNumber}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📞</span>
                  <span>Call</span>
                </button>
              ) : (
                <button
                  onClick={handleHangup}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>📵</span>
                  <span>Hang Up</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <>
            {/* Phone Number Input */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder="(555) 123-4567"
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* Message Input */}
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
                maxLength={160}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
              <div className="text-right text-white/60 text-xs mt-1">
                {smsMessage.length}/160
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendSMS}
              disabled={!isConnected || !phoneNumber || !smsMessage.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>💬</span>
              <span>Send SMS</span>
            </button>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Call History */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">📞</span>
                Recent Calls
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {callHistory.length > 0 ? (
                  callHistory.slice(0, 5).map((call) => (
                    <div key={call.id} className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium">
                            {call.direction === 'outbound' ? call.to : call.from}
                          </p>
                          <p className="text-white/60 text-sm">
                            {call.direction === 'outbound' ? '📞 Outbound' : '📱 Inbound'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white/80 text-sm">
                            {call.timestamp.toLocaleDateString()}
                          </p>
                          <p className={`text-xs ${
                            call.status === 'completed' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {call.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No call history</p>
                )}
              </div>
            </div>

            {/* Message History */}
            <div>
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <span className="mr-2">💬</span>
                Recent Messages
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {messageHistory.length > 0 ? (
                  messageHistory.slice(0, 5).map((message) => (
                    <div key={message.id} className="bg-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-medium">
                          {message.direction === 'outbound' ? message.to : message.from}
                        </p>
                        <p className="text-white/60 text-xs">
                          {message.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-white/80 text-sm">{message.body}</p>
                      <p className={`text-xs mt-1 ${
                        message.status === 'delivered' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {message.direction === 'outbound' ? '→' : '←'} {message.status}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-white/60 text-center py-4">No message history</p>
                )}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={loadHistory}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
            >
              🔄 Refresh History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneInterface;