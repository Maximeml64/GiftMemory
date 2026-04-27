// src/utils/notifications.ts

import * as Notifications from 'expo-notifications';
import { CalendarEvent } from '../types';
import { nextOccurrence, EVENT_TYPE_CONFIG } from './eventUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function cancelEventNotifications(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`event_${eventId}_reminder`).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(`event_${eventId}_today`).catch(() => {});
}

export async function scheduleEventNotifications(event: CalendarEvent): Promise<void> {
  await cancelEventNotifications(event.id);
  const granted = await requestNotificationPermissions();
  if (!granted) return;

  const config = EVENT_TYPE_CONFIG[event.type];
  const next = nextOccurrence(event.month, event.day);
  const now = new Date();

  const triggerDate = new Date(next);
  triggerDate.setDate(triggerDate.getDate() - event.reminderDays);
  triggerDate.setHours(9, 0, 0, 0);
  if (triggerDate <= now) triggerDate.setFullYear(triggerDate.getFullYear() + 1);

  const daysText = event.reminderDays === 1 ? 'demain' : `dans ${event.reminderDays} jours`;

  await Notifications.scheduleNotificationAsync({
    identifier: `event_${event.id}_reminder`,
    content: {
      title: `${config.emoji} ${event.personName}`,
      body: `${event.type} de ${event.personName} ${daysText} !${event.giftGiven ? ` Cadeau prévu : ${event.giftGiven}` : ''}`,
      data: { eventId: event.id },
    },
    trigger: { date: triggerDate, repeats: false } as any,
  });

  const dayTrigger = new Date(next);
  dayTrigger.setHours(9, 0, 0, 0);
  if (dayTrigger > now) {
    await Notifications.scheduleNotificationAsync({
      identifier: `event_${event.id}_today`,
      content: {
        title: `${config.emoji} ${event.personName} — ${event.type}`,
        body: `C'est aujourd'hui ! 🎉${event.giftGiven ? ` Cadeau prévu : ${event.giftGiven}` : ''}`,
        data: { eventId: event.id },
      },
      trigger: { date: dayTrigger, repeats: false } as any,
    });
  }
}