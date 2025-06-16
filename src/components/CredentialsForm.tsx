import React, { useState } from 'react';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

interface CredentialsFormProps {
  onConnect: (credentials: TwilioCredentials) => void;
}

const CredentialsForm: React.FC<CredentialsFormProps> = ({ onConnect }) => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showTokens, setShowTokens] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountSid || !authToken || !phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    // Basic validation
    if (!accountSid.startsWith('AC')) {
      alert('Account SID should start with "AC"');
      return;
    }

    if (!phoneNumber.startsWith('+')) {
      alert('Phone number should start with "+" and include country code');
      return;
    }

    onConnect({
      accountSid: accountSid.trim(),
      authToken: authToken.trim(),
      phoneNumber: phoneNumber.trim()
    });
  };

  const handlePhoneNumberChange = (value: string) => {
    // Auto-format phone number
    let formatted = value.replace(/[^\d+]/g, '');
    if (!formatted.startsWith('+') && formatted.length > 0) {
      formatted = '+' + formatted;
    }
    setPhoneNumber(formatted);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Enter Twilio Credentials
        </h2>
        
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div className="text-yellow-200 text-sm">
              <p className="font-semibold mb-1">Security Notice:</p>
              <p>Your credentials are only stored in memory during this session and are never saved or transmitted to any server.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountSid" className="block text-white text-sm font-medium mb-2">
              Account SID
            </label>
            <input
              type="text"
              id="accountSid"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              placeholder="AC..."
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="authToken" className="block text-white text-sm font-medium mb-2">
              Auth Token
            </label>
            <div className="relative">
              <input
                type={showTokens ? "text" : "password"}
                id="authToken"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                placeholder="Your auth token"
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowTokens(!showTokens)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showTokens ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-white text-sm font-medium mb-2">
              Twilio Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="+1234567890"
              className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            Connect to Twilio
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-xs">
            Need help? Check your{' '}
            <a 
              href="https://console.twilio.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Twilio Console
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CredentialsForm;