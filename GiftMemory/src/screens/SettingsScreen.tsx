// src/screens/SettingsScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  async function openMail() {
    const url = 'mailto:m.maurylaribiere@gmail.com?subject=GiftMemory%20-%20Question%20%2F%20Probl%C3%A8me';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application mail.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Paramètres</Text>

        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appIcon}>🎁</Text>
          <Text style={styles.appName}>GiftMemory</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        {/* Section Légal */}
        <Text style={styles.sectionTitle}>Légal</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="📄"
            label="Conditions générales d'utilisation"
            onPress={() => navigation.navigate('Cgu')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="🔒"
            label="Politique de confidentialité"
            onPress={() => navigation.navigate('Privacy')}
          />
        </View>

        {/* Section Contact */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="✉️"
            label="Nous contacter"
            sublabel="m.maurylaribiere@gmail.com"
            onPress={openMail}
          />
        </View>

        <Text style={styles.footer}>
          GiftMemory • Fait avec ❤️{'\n'}
          Toutes vos données sont stockées localement sur votre appareil.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={rowStyles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={rowStyles.icon}>{icon}</Text>
      <View style={rowStyles.text}>
        <Text style={rowStyles.label}>{label}</Text>
        {sublabel && <Text style={rowStyles.sublabel}>{sublabel}</Text>}
      </View>
      <Text style={rowStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  icon: { fontSize: 20, marginRight: 12 },
  text: { flex: 1 },
  label: { ...Typography.bodyMedium, color: Colors.text },
  sublabel: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.textTertiary },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  title: { ...Typography.displayMedium, color: Colors.text, paddingTop: Spacing.sm, marginBottom: Spacing.lg },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  appIcon: { fontSize: 56, marginBottom: 8 },
  appName: { ...Typography.titleLarge, color: Colors.text },
  appVersion: { ...Typography.caption, color: Colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  footer: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.md,
  },
});
