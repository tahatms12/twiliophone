import { useState } from 'react';
import PhoneInterface from './components/PhoneInterface';
import CredentialsForm from './components/CredentialsForm';
import { TwilioService } from './services/TwilioService';
import { TwilioCredentials } from './types';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [twilioService, setTwilioService] = useState<TwilioService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<TwilioCredentials | null>(null);

  const initializeTwilio = async (creds: TwilioCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const service = new TwilioService(creds);
      await service.initialize();
      
      setTwilioService(service);
      setCredentials(creds);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to initialize Twilio:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Twilio');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (twilioService) {
      twilioService.destroy();
    }
    setTwilioService(null);
    setCredentials(null);
    setIsConnected(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Connecting to Twilio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-center max-w-md">
          <div className="text-red-400 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-semibold mb-2">Connection Error</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Twilio Phone</h1>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-white/80">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {credentials && (
            <div className="mt-2 text-white/60 text-sm">
              Using number: {credentials.phoneNumber}
            </div>
          )}
        </header>

        {!isConnected ? (
          <CredentialsForm onConnect={initializeTwilio} />
        ) : (
          <div>
            <div className="text-center mb-4">
              <button
                onClick={handleDisconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Disconnect & Clear Credentials
              </button>
            </div>
            {twilioService && (
              <PhoneInterface 
                twilioService={twilioService}
                isConnected={isConnected}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;