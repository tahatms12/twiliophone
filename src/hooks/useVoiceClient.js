import { useEffect, useRef } from 'react';
import { Device } from 'twilio-client';
import { usePhone } from '../context/PhoneContext';
import { fetchToken } from '../service/token';

export default function useVoiceClient() {
  const deviceRef = useRef(null);
  const { dispatch } = usePhone();

  useEffect(() => {
    async function setup() {
      const token = await fetchToken();
      deviceRef.current = new Device(token, { debug: true });
      deviceRef.current.on('incoming', call => {
        dispatch({ type: 'LOG_ACTIVITY', entry: { type: 'incoming-call', from: call.from, timestamp: Date.now() } });
        // accept automatically for demo
        call.accept();
      });
    }
    setup();
    return () => deviceRef.current && deviceRef.current.destroy();
  }, [dispatch]);

  const makeCall = (number) => {
    if (!deviceRef.current) return;
    const connection = deviceRef.current.connect({ To: number });
    dispatch({ type: 'LOG_ACTIVITY', entry: { type: 'outgoing-call', to: number, timestamp: Date.now() } });
    return connection;
  };

  return { makeCall };
}
