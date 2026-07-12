# GiftMemory — CLAUDE.md

> Standard global : `~/.claude/CLAUDE.md` (le `../CLAUDE.md` cité avant n'existe pas). Ce fichier = contraintes propres à l'app.

## Rôle
App mobile Expo **iOS-only**, 100 % locale (aucun backend) : suivi des cadeaux offerts/reçus, événements avec rappels, personnes. FR. Entrée par `App.tsx` (`expo/AppEntry.js`), pas de dossier `app/`.

## Stack figée (NE PAS migrer sans demande explicite)
**React Navigation v7** (native-stack + bottom-tabs — PAS expo-router, coût de refacto > bénéfice) · **React Context** (3 providers imbriqués `Gifts > Events > Purchase` sous ErrorBoundary — pas de Zustand) · RevenueCat (`react-native-purchases` 10) · AsyncStorage + `expo-file-system/legacy` · Sentry 7 · TypeScript ~5.9 strict. Pas de Zod, TanStack Query, MMKV. **EAS Dev Build est la norme** (`expo-dev-client` installé) — plus Expo Go (une garde isExpoGo subsiste en défense dans PurchaseContext). `newArchEnabled: false` volontaire — ne pas l'activer au passage.

## Commandes
```bash
npm install                 # .npmrc force legacy-peer-deps=true
npm test                    # jest (preset jest-expo inline dans package.json), tests dans src/utils/__tests__/
npx tsc --noEmit            # typecheck
npm start                   # expo start
npm run ios                 # expo run:ios (Dev Build)
eas build --profile development|preview|production --platform ios
```

## Structure
`App.tsx` (navigation + providers + Sentry.init/wrap) ; `src/screens/` (12 écrans : 5 onglets Home/Gifts/Events/Givers/Settings + 6 en stack — AddGift/AddEvent/Paywall en modal — + Onboarding rendu HORS navigation, conditionnellement dans App.tsx avant le NavigationContainer, absent de RootStackParamList) ; `src/store/` (GiftsContext, EventsContext, PurchaseContext) ; `src/hooks/usePremiumGate.ts` ; `src/utils/` (dateUtils, eventUtils, notifications, storage, theme + `__tests__/`) ; `src/components/` + `src/components/ui/` (barrel `index.ts` + `icons.ts` lucide). Types centraux : `src/types/index.ts`.
⚠️ Dossier parasite vide `{src\{screens,...},assets}` à la racine (brace-expansion ratée sous Windows, non tracké) — ignorer, ne pas le confondre avec `src/`.
⚠️ L'alias tsconfig `@/*` est déclaré mais **aucun import ne l'utilise et babel n'a pas de module-resolver** → il planterait au runtime Metro. Imports relatifs uniquement.

## Persistance & données
- Clés AsyncStorage : `@gift_memory_gifts`, `@gift_memory_events`, `@gift_memory_onboarding_done`, `@gift_memory_thank_you_enabled`. `storage.ts` fait du read-modify-write du tableau complet.
- **Migration inline jamais persistée** : `loadGifts` applique `direction ?? 'received'` et `status ?? 'done'` à CHAQUE lecture, et `filter(isValidGift)` **droppe silencieusement** les entrées malformées. `direction`/`status` restent optionnels dans le type `Gift` — tout code doit tolérer leur absence.
- Images dans `documentDirectory/gift_images/` : photo principale `{giftId}.jpg` (1280 px, q0.75), reçu `{giftId}_receipt.jpg` — noms déterministes, un re-pick écrase. `deleteGift` supprime aussi les fichiers images (destructif).
- **Dates calendaires : jamais `Date.toISOString()`** (décalait de −1 jour en UTC+) — utiliser `toISODateString` (heure locale) ; test de non-régression dans `dateUtils.test.ts`.

## Premium / freemium
Entitlement RevenueCat `premium`, clé `EXPO_PUBLIC_REVENUECAT_IOS_KEY` (la clé Android présente dans `.env` n'est lue nulle part — app iOS-only). Limites : `FREE_GIFTS_LIMIT=10`, `FREE_EVENTS_LIMIT=5` (`usePremiumGate.ts`) → navigate('Paywall'). Paywall = **achat unique lifetime** non-consommable, liens CGU/confidentialité Notion obligatoires Apple. `reloadOfferings` existe pour re-fetch après échec réseau.

## Pièges restants
- **Bundle ID = `com.maximeml.giftmemory`** — l'ancien `com.maxime.giftmemory` est PÉRIMÉ (App Store Connect ascAppId 6763744717 est sous maximeml). Ne jamais revenir en arrière.
- `EventType` n'a plus `Naissance` mais le type `Occasion` des cadeaux l'a encore — ne pas les confondre. Le champ étiquettes/tags a été supprimé ; la recherche matche nom + personne uniquement.
- Notifications : un seul rappel par événement (`event_{id}_reminder` ; la purge nettoie aussi l'ancien id `_today` legacy) ; `reminderHour/Minute` optionnels, défaut 09:00 ; événements one-off (mariage, `year` présent) ne se replanifient pas si passés, les récurrents roulent à +1 an. Rappel remerciement J+1 10:00 (cadeaux received+done, toggle ON par défaut).
- Sentry : `EXPO_PUBLIC_SENTRY_DSN` attendu par App.tsx mais défini **nulle part** (ni .env ni eas.json) → Sentry inerte en l'état. `SENTRY_DISABLE_AUTO_UPLOAD=true` dans les 3 profils EAS.
- `expo-file-system/legacy` volontaire sous SDK 54 — ne pas « moderniser » sans migration complète. IDs via `Crypto.randomUUID()` d'expo-crypto (la dep `uuid` a été supprimée, ne pas la réintroduire).
- Référence canonique swipe-to-delete : `src/screens/EventsScreen.tsx` (Swipeable de gesture-handler).
- `ios/`/`android/` gitignorés (CNG, régénérés par EAS) ; `yarn.lock` gitignoré exprès (projet npm). Support : contact@mdlnlab.com.

## Repères
EAS projectId `e12cf3b3-e99d-43de-b7e8-13731d3e45d0`. Submit iOS : appleTeamId `4PPFJP4B66`, ascAppId `6763744717`. Build production : image `macos-sequoia-15.6-xcode-26.2` épinglée, autoIncrement, appVersionSource remote. Scheme `giftmemory`, `userInterfaceStyle: light`.
