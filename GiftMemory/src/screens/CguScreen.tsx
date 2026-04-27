// src/screens/CguScreen.tsx

import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../utils/theme';

export default function CguScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdate}>Dernière mise à jour : avril 2025</Text>

        <Section title="1. Objet">
          Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de l'application mobile GiftMemory. En utilisant l'application, vous acceptez sans réserve les présentes CGU.
        </Section>

        <Section title="2. Description du service">
          GiftMemory est une application mobile permettant de mémoriser les cadeaux reçus (nom, donneur, occasion, date, photo). L'application fonctionne entièrement en local sur votre appareil. Aucune donnée n'est transmise à des serveurs externes.
        </Section>

        <Section title="3. Utilisation de l'application">
          L'application est destinée à un usage personnel. Vous vous engagez à ne pas l'utiliser à des fins illicites ou contraires aux bonnes mœurs.
        </Section>

        <Section title="4. Propriété intellectuelle">
          L'application GiftMemory et l'ensemble de ses composants (code, design, contenu) sont la propriété exclusive de leur auteur. Toute reproduction ou distribution sans autorisation est interdite.
        </Section>

        <Section title="5. Limitation de responsabilité">
          L'auteur de GiftMemory ne saurait être tenu responsable de toute perte de données. Il est recommandé de sauvegarder régulièrement votre appareil via les outils fournis par votre système d'exploitation.
        </Section>

        <Section title="6. Modification des CGU">
          Les présentes CGU peuvent être modifiées à tout moment. La date de mise à jour en haut de ce document indique la version en vigueur.
        </Section>

        <Section title="7. Contact">
          Pour toute question relative aux CGU : m.maurylaribiere@gmail.com
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={sectionStyles.container}>
      <Text style={sectionStyles.title}>{title}</Text>
      <Text style={sectionStyles.body}>{children}</Text>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  title: { ...Typography.titleMedium, color: Colors.text, marginBottom: 6 },
  body: { ...Typography.body, color: Colors.textSecondary, lineHeight: 22 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },
  lastUpdate: { ...Typography.caption, color: Colors.textTertiary, marginBottom: Spacing.lg },
});
