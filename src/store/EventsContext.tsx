// src/store/EventsContext.tsx

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalendarEvent } from '../types';
import { scheduleEventNotifications, cancelEventNotifications } from '../utils/notifications';

const EVENTS_KEY = '@gift_memory_events';

interface EventsState { events: CalendarEvent[]; loading: boolean; }
type Action = { type: 'SET_EVENTS'; payload: CalendarEvent[] } | { type: 'SET_LOADING'; payload: boolean };

function reducer(state: EventsState, action: Action): EventsState {
  switch (action.type) {
    case 'SET_EVENTS': return { ...state, events: action.payload, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
}

interface EventsContextValue extends EventsState {
  saveEvent: (event: CalendarEvent) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  getEventById: (eventId: string) => CalendarEvent | undefined;
}

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { events: [], loading: true });

  useEffect(() => {
    AsyncStorage.getItem(EVENTS_KEY).then((raw) => {
      dispatch({ type: 'SET_EVENTS', payload: raw ? JSON.parse(raw) : [] });
    });
  }, []);

  const persist = useCallback(async (events: CalendarEvent[]) => {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
    dispatch({ type: 'SET_EVENTS', payload: events });
  }, []);

  const saveEvent = useCallback(async (event: CalendarEvent) => {
    const current = state.events;
    const index = current.findIndex((e) => e.id === event.id);
    const updated = index >= 0 ? current.map((e) => e.id === event.id ? event : e) : [event, ...current];
    await persist(updated);
    await scheduleEventNotifications(event);
  }, [state.events, persist]);

  const removeEvent = useCallback(async (eventId: string) => {
    await persist(state.events.filter((e) => e.id !== eventId));
    await cancelEventNotifications(eventId);
  }, [state.events, persist]);

  const getEventById = useCallback((eventId: string) => state.events.find((e) => e.id === eventId), [state.events]);

  return (
    <EventsContext.Provider value={{ ...state, saveEvent, removeEvent, getEventById }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents(): EventsContextValue {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used within EventsProvider');
  return ctx;
}