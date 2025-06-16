import React from 'react';
import { usePhone } from '../context/PhoneContext';

export default function ActivityFeed() {
  const { state } = usePhone();
  return (
    <div className="p-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
      {state.activityLog.map((entry, idx) => (
        <div key={idx} className="border-b py-1 text-sm">
          <div>{entry.type}</div>
          <div>{entry.to || entry.from}</div>
          <div>{entry.body}</div>
          <div>{new Date(entry.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
