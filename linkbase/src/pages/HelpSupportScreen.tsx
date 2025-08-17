import React from "react";
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeStore } from "@/hooks/useThemeStore";

const QUESTIONS: { q: string; a: string }[] = [
  { q: "What is Linkbase?", a: "A place to store and recall connections with facts and socials." },
  { q: "How do I add a new connection?", a: "Use the + button or the Voice Connections screen to add multiple." },
  { q: "Can I search my connections?", a: "Yes, use the search bar. AI-powered search understands facts and context." },
  { q: "How do I edit a connection?", a: "Open a connection and tap Edit to update details and facts." },
  { q: "How to delete a connection?", a: "Open the connection and use the Delete action in the menu." },
  { q: "Does Linkbase work offline?", a: "Basic browsing works; some features (AI, voice) require internet." },
  { q: "Is my data private?", a: "See Privacy Policy in Settings for details about data handling." },
  { q: "How can I back up my data?", a: "Use Sync to set an email and enable SSO recovery across devices." },
  { q: "How to enable reminders?", a: "In Notifications, enable daily reminders and set your preferred time." },
  { q: "What are voice connections?", a: "Record audio to extract multiple connections automatically." },
  { q: "Which platforms are supported?", a: "iOS and Android via Expo." },
  { q: "How do themes work?", a: "In Appearance, switch between Exo, Warm Pastel, and Light Mode." },
  { q: "Can I export my connections?", a: "Export options are coming soon." },
  { q: "How do I contact support?", a: "Email kaloyan@bozhkov.com at any time." },
  { q: "Why do I need an email?", a: "To enable SSO recovery and sync across devices." },
  { q: "Does AI store my audio?", a: "Audio is processed to text for extraction. See Privacy for details." },
  { q: "Can I change reminder time?", a: "Yes, in Notifications. Default is 10:00 PM." },
  { q: "Does search support synonyms?", a: "Yes, include query expansion for better recall." },
  { q: "Are social media links auto-filled?", a: "We generate URLs from handles where possible." },
  { q: "How to reset my theme?", a: "Open Appearance and reselect your preferred theme." },
];

const HelpSupportScreen: React.FC = () => {
  const { colors } = useThemeStore();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient colors={colors.gradients.background} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Help & Support</Text>
          <View style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.border.light }] }>
            {QUESTIONS.map((item, idx) => (
              <View key={idx} style={styles.qaItem}>
                <Text style={[styles.q, { color: colors.text.accent }]}>{idx + 1}. {item.q}</Text>
                <Text style={[styles.a, { color: colors.text.secondary }]}>{item.a}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.card, { backgroundColor: colors.background.surface, borderColor: colors.border.light }] }>
            <Text style={[styles.subtitle, { color: colors.text.primary }]}>Contact Support</Text>
            <Text
              onPress={() => Linking.openURL("mailto:kaloyan@bozhkov.com")}
              style={[styles.link, { color: colors.text.accent }]}
            >
              kaloyan@bozhkov.com
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1 },
  qaItem: { marginBottom: 12 },
  q: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  a: { fontSize: 14 },
  link: { fontSize: 16, fontWeight: "600" },
});

export default HelpSupportScreen;

