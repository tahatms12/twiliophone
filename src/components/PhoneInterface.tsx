import React, { useState } from 'react';
import { TwilioService } from '../services/TwilioService';

interface PhoneInterfaceProps {
  twilioService: TwilioService;
  isConnected: boolean;
}

const PhoneInterface: React.FC<PhoneInterfaceProps> = ({ twilioService, isConnected }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');

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
      setIsCallActive(true);
      setCallStatus('Connecting...');
      
      const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
      await twilioService.makeCall(`+1${cleanNumber}`);
      
      setCallStatus('Connected');
    } catch (error) {
      console.error('Call failed:', error);
      setCallStatus('Call failed');
      setIsCallActive(false);
    }
  };

  const handleHangup = async () => {
    try {
      await twilioService.hangup();
      setIsCallActive(false);
      setCallStatus('');
    } catch (error) {
      console.error('Hangup failed:', error);
    }
  };

  const handleClear = () => {
    setPhoneNumber('');
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

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        {/* Display */}
        <div className="bg-black/20 rounded-lg p-4 mb-6 text-center">
          <div className="text-white text-2xl font-mono mb-2 min-h-[2rem]">
            {phoneNumber || 'Enter number'}
          </div>
          {callStatus && (
            <div className="text-green-400 text-sm">{callStatus}</div>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {keypadButtons.flat().map((digit) => (
            <button
              key={digit}
              onClick={() => handleNumberInput(digit)}
              disabled={isCallActive}
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
            disabled={isCallActive}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleBackspace}
            disabled={isCallActive}
            className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
          >
            ⌫
          </button>
        </div>

        {/* Call/Hangup Button */}
        <div className="flex space-x-3">
          {!isCallActive ? (
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
      </div>
    </div>
  );
};

export default PhoneInterface;