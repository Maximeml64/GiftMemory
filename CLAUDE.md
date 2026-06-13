# GiftMemory — Stack figée

> Standard global : `../CLAUDE.md`. Ce fichier ne liste que les contraintes propres à cette app.

## Stack en prod (NE PAS migrer sans demande explicite)

- **Routing** : React Navigation (pas expo-router)
- **State** : React Context (pas Zustand)
- **Premium** : RevenueCat
- **Bundle ID** : `com.maximeml.giftmemory`

## Règles de modification

- **Pas de migration vers Zustand** sauf si je le demande explicitement (l'app fonctionne, le coût de refacto dépasse le bénéfice).
- **Pas de migration vers expo-router** : React Navigation tient la route.
- **Pas de Zod, pas de TanStack Query, pas de MMKV** sauf demande explicite.
- **Build mode** : EAS Dev Build (norme depuis mai 2026). Tests sur iPhone physique via le Dev Build.
- Référence canonique pour le pattern swipe-to-delete : `src/screens/EventsScreen.tsx`.
