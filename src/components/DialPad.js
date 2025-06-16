import React, { useState } from 'react';
import useVoiceClient from '../hooks/useVoiceClient';

export default function DialPad() {
  const [number, setNumber] = useState('');
  const { makeCall } = useVoiceClient();

  const handleDigit = d => setNumber(n => n + d);

  const handleCall = () => {
    if (number) {
      makeCall(number);
      setNumber('');
    }
  };

  return (
    <div className="p-2">
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(d => (
          <button key={d} className="border p-4" onClick={() => handleDigit(d.toString())}>{d}</button>
        ))}
      </div>
      <input className="border p-1 w-full mt-2" value={number} readOnly />
      <button className="bg-green-500 text-white mt-2 w-full" onClick={handleCall}>Call</button>
    </div>
  );
}
