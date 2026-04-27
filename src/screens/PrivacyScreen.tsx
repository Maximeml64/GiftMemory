// src/screens/PrivacyScreen.tsx

import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../utils/theme';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : avril 2025</Text>
        <Section title="1. Collecte de données">GiftMemory ne collecte aucune donnée personnelle. L'application fonctionne entièrement hors ligne. Aucune information n'est transmise à des serveurs tiers, à des annonceurs ou à des partenaires commerciaux.</Section>
        <Section title="2. Données stockées localement">Les informations que vous saisissez (noms, photos, dates) sont stockées uniquement sur votre appareil, dans le stockage privé de l'application. Ces données ne sont accessibles que par vous.</Section>
        <Section title="3. Photos">Les photos que vous ajoutez sont copiées dans le stockage privé de l'application. Elles ne sont pas partagées, ni transmises. La suppression d'un cadeau entraîne la suppression définitive de la photo associée.</Section>
        <Section title="4. Permissions utilisées">L'application peut demander l'accès à votre caméra et à votre photothèque uniquement pour vous permettre d'ajouter des photos. Ces permissions ne sont jamais utilisées à d'autres fins.</Section>
        <Section title="5. Suppression des données">Pour supprimer l'ensemble de vos données, désinstallez simplement l'application. Toutes les données locales seront supprimées automatiquement par votre système d'exploitation.</Section>
        <Section title="6. Contact">Pour toute question relative à la confidentialité : m.maurylaribiere@gmail.com</Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.container}>
      <Text style={s.title}>{title}</Text>
      <Text style={s.body}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  title: { ...Typography.titleMedium, color: Colors.text, marginBottom: 6 },
  body: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  lastUpdate: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.lg },
});