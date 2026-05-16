import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

const expectedLabels = {
  de: ['Startseite', 'Abonnements', 'Benachrichtigungen', 'Einstellungen'],
  en: ['Home', 'Subscriptions', 'Notifications', 'Settings'],
  fr: ['Accueil', 'Abonnements', 'Notifications', 'Paramètres'],
  it: ['Home', 'Abbonamenti', 'Avvisi', 'Impostazioni'],
  ro: ['Acasă', 'Abonamente', 'Notificări', 'Setări'],
  ru: ['Главная', 'Подписки', 'Уведомления', 'Настройки'],
};

describe('navigation labels', () => {
  for (const [locale, labels] of Object.entries(expectedLabels)) {
    it(`uses full navigation words in ${locale}`, () => {
      const translations = JSON.parse(readFileSync(`src/i18n/locales/${locale}.json`, 'utf8'));
      const navigationLabels = [
        translations.navigation.dashboard,
        translations.navigation.subscriptions,
        translations.navigation.reminders,
        translations.navigation.settings,
      ];

      assert.deepEqual(navigationLabels, labels);
      assert.equal(navigationLabels.some((label) => label.includes('.')), false);
    });
  }
});
