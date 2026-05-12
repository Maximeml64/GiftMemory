// src/utils/notifications.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CalendarEvent, Gift } from '../types';
import { nextOccurrence, EVENT_TYPE_CONFIG } from './eventUtils';

const THANK_YOU_ENABLED_KEY = '@gift_memory_thank_you_enabled';

export async function isThankYouRemindersEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(THANK_YOU_ENABLED_KEY);
    // Default ON when the user has never toggled it.
    return raw === null ? true : raw === 'true';
  } catch {
    return true;
  }
}

export async function setThankYouRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(THANK_YOU_ENABLED_KEY, enabled ? 'true' : 'false');
}

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
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
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
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dayTrigger,
      },
    });
  }
}

// ─── Thank-you reminders ──────────────────────────────────────────────────────

function thankYouIdentifier(giftId: string): string {
  return `gift_${giftId}_thankyou`;
}

export async function cancelThankYouReminder(giftId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(thankYouIdentifier(giftId)).catch(() => {});
}

/**
 * Schedules a single "pense à remercier" notification the day after a
 * received gift, at 10am local time. Only acts for received+done gifts
 * whose date is today or in the future (or yesterday and the trigger
 * window hasn't passed yet). Idempotent: always cancels the previous
 * reminder for this gift first.
 */
export async function scheduleThankYouReminder(gift: Gift): Promise<void> {
  await cancelThankYouReminder(gift.id);

  if (gift.direction !== 'received') return;
  if ((gift.status ?? 'done') !== 'done') return;

  const enabled = await isThankYouRemindersEnabled();
  if (!enabled) return;

  if (!gift.date) return;
  const giftDate = new Date(gift.date + 'T12:00:00');
  if (isNaN(giftDate.getTime())) return;

  const trigger = new Date(giftDate);
  trigger.setDate(trigger.getDate() + 1);
  trigger.setHours(10, 0, 0, 0);

  // Skip if the reminder would fire in the past (more than ~1 minute ago).
  if (trigger.getTime() < Date.now() - 60_000) return;

  const granted = await requestNotificationPermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    identifier: thankYouIdentifier(gift.id),
    content: {
      title: `🙏 Pensez à remercier ${gift.giver}`,
      body: `${gift.name} — un mot, un message, ça compte.`,
      data: { giftId: gift.id, kind: 'thank-you' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });
}

// Re-evaluate all gift thank-you reminders after the global toggle changes.
export async function rescheduleAllThankYouReminders(gifts: Gift[]): Promise<void> {
  for (const g of gifts) {
    await scheduleThankYouReminder(g);
  }
}

export async function cancelAllThankYouReminders(gifts: Gift[]): Promise<void> {
  for (const g of gifts) {
    await cancelThankYouReminder(g.id);
  }
}
