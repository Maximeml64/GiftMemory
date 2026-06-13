// src/utils/notifications.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { CalendarEvent, Gift } from '../types';
import { eventTargetDate, EVENT_TYPE_CONFIG } from './eventUtils';

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
  const { status: existing, canAskAgain } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  // Avoid re-prompting if the OS already denied and won't ask again —
  // otherwise we'd silently no-op every save without telling the user.
  if (existing === 'denied' && canAskAgain === false) return false;
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

  const emoji = EVENT_TYPE_CONFIG[event.type]?.emoji ?? '🎉';
  const target = eventTargetDate(event);
  const now = new Date();
  // Default 09:00 for events created before the time-of-reminder feature.
  const hour = event.reminderHour ?? 9;
  const minute = event.reminderMinute ?? 0;

  // Single reminder: reminderDays before the event (0 = the day itself) at the
  // chosen time.
  const triggerDate = new Date(target);
  triggerDate.setDate(triggerDate.getDate() - event.reminderDays);
  triggerDate.setHours(hour, minute, 0, 0);
  if (triggerDate <= now) {
    // One-off events (a fixed year) don't recur — if the reminder window has
    // passed, there's nothing to schedule. Recurring events roll to next year.
    if (event.year != null) return;
    triggerDate.setFullYear(triggerDate.getFullYear() + 1);
  }

  const isDayOf = event.reminderDays === 0;
  const giftSuffix = event.giftGiven ? ` Cadeau prévu : ${event.giftGiven}` : '';
  const title = `${emoji} ${event.personName}${isDayOf ? ` — ${event.type}` : ''}`;
  const body = isDayOf
    ? `C'est aujourd'hui ! 🎉${giftSuffix}`
    : `${event.type} de ${event.personName} ${event.reminderDays === 1 ? 'demain' : `dans ${event.reminderDays} jours`} !${giftSuffix}`;

  await Notifications.scheduleNotificationAsync({
    identifier: `event_${event.id}_reminder`,
    content: { title, body, data: { eventId: event.id } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
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
