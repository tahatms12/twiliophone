import { useEffect, useRef } from 'react';
import { Client as ConversationsClient } from 'twilio-conversations';
import { usePhone } from '../context/PhoneContext';
import { fetchToken } from '../service/token';

export default function useConversations() {
  const clientRef = useRef(null);
  const { dispatch } = usePhone();

  useEffect(() => {
    async function setup() {
      const token = await fetchToken();
      clientRef.current = await ConversationsClient.create(token);
      clientRef.current.on('messageAdded', msg => {
        dispatch({ type: 'LOG_ACTIVITY', entry: { type: 'incoming-sms', body: msg.body, from: msg.author, timestamp: Date.now() } });
      });
    }
    setup();
  }, [dispatch]);

  const sendMessage = async (to, body) => {
    if (!clientRef.current) return;
    const convo = await clientRef.current.getConversationByUniqueName(to);
    const message = await convo.sendMessage(body);
    dispatch({ type: 'LOG_ACTIVITY', entry: { type: 'outgoing-sms', to, body, timestamp: Date.now() } });
    return message;
  };

  return { sendMessage };
}
