import React, { useState } from 'react';
import { usePhone } from '../context/PhoneContext';
import { v4 as uuid } from 'uuid';

export default function ContactList() {
  const { state, dispatch } = usePhone();
  const [form, setForm] = useState({ name: '', phone: '', notes: '' });

  const addContact = () => {
    if (!form.name || !form.phone) return;
    dispatch({ type: 'ADD_CONTACT', contact: { id: uuid(), ...form } });
    setForm({ name: '', phone: '', notes: '' });
  };

  return (
    <div className="p-2">
      <input className="border p-1 w-full" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      <input className="border p-1 w-full mt-1" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      <textarea className="border p-1 w-full mt-1" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      <button className="bg-blue-500 text-white w-full mt-2" onClick={addContact}>Add</button>
      <div className="mt-4">
        {state.contacts.map(c => (
          <div key={c.id} className="border-b py-1">
            <div>{c.name} - {c.phone}</div>
            <div className="text-xs">{c.notes}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
