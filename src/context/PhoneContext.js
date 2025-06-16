import React, { createContext, useReducer, useContext } from 'react';

const PhoneContext = createContext();

const initialState = {
  contacts: [],
  activityLog: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_CONTACT':
      return { ...state, contacts: [...state.contacts, action.contact] };
    case 'UPDATE_CONTACT':
      return {
        ...state,
        contacts: state.contacts.map(c =>
          c.id === action.contact.id ? action.contact : c
        )
      };
    case 'LOG_ACTIVITY':
      return { ...state, activityLog: [action.entry, ...state.activityLog] };
    default:
      return state;
  }
}

export function PhoneProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <PhoneContext.Provider value={{ state, dispatch }}>
      {children}
    </PhoneContext.Provider>
  );
}

export function usePhone() {
  return useContext(PhoneContext);
}

