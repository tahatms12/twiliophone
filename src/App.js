import React from 'react';
import DialPad from './components/DialPad';
import ActivityFeed from './components/ActivityFeed';
import ContactList from './components/ContactList';
import { PhoneProvider, usePhone } from './context/PhoneContext';
import { exportLog } from './utils/csv';

function Layout() {
  const { state } = usePhone();
  const download = () => exportLog(state.activityLog, process.env.REACT_APP_TWILIO_CSV_FILENAME);
  return (
    <div className="p-4 grid grid-cols-3 gap-4 relative">
      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2">online</div>
      <DialPad />
      <ActivityFeed />
      <ContactList />
      <button className="col-span-3 bg-gray-800 text-white p-2" onClick={download}>Download CSV</button>
    </div>
  );
}

export default function App() {
  return (
    <PhoneProvider>
      <Layout />
    </PhoneProvider>
  );
}
