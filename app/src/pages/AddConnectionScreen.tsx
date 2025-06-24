import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { useConnectionStore } from "../hooks/useConnectionStore";
import Button from "../components/atoms/Button";
import Input from "../components/atoms/Input";

type AddConnectionScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "AddConnection"
>;

interface Props {
  navigation: AddConnectionScreenNavigationProp;
}

const AddConnectionScreen: React.FC<Props> = ({ navigation }) => {
  const { createConnection, loading } = useConnectionStore();

  const [formData, setFormData] = useState({
    name: "",
    igHandle: "",
    metAt: "",
    facts: [""],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.metAt.trim()) {
      newErrors.metAt = "Meeting place is required";
    }

    const validFacts = formData.facts.filter((fact) => fact.trim());
    if (validFacts.length === 0) {
      newErrors.facts = "At least one fact is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const validFacts = formData.facts.filter((fact) => fact.trim());
      await createConnection({
        name: formData.name.trim(),
        igHandle: formData.igHandle.trim() || undefined,
        metAt: formData.metAt.trim(),
        facts: validFacts,
      });

      Alert.alert("Success", "Connection added successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add connection");
    }
  };

  const addFactField = () => {
    setFormData((prev) => ({
      ...prev,
      facts: [...prev.facts, ""],
    }));
  };

  const removeFactField = (index: number) => {
    if (formData.facts.length > 1) {
      setFormData((prev) => ({
        ...prev,
        facts: prev.facts.filter((_, i) => i !== index),
      }));
    }
  };

  const updateFact = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      facts: prev.facts.map((fact, i) => (i === index ? value : fact)),
    }));
  };

  return (
    <LinearGradient colors={["#0a0d14", "#1e293b"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New Connection</Text>
          <Text style={styles.headerSubtitle}>Build your network</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Input
              label="Name *"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
              error={errors.name}
              placeholder="Enter their name"
            />

            <Input
              label="Instagram Handle"
              value={formData.igHandle}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, igHandle: text }))
              }
              placeholder="@username (optional)"
            />

            <Input
              label="Where did you meet? *"
              value={formData.metAt}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, metAt: text }))
              }
              error={errors.metAt}
              placeholder="Coffee shop, conference, party, etc."
            />

            <View style={styles.factsSection}>
              <LinearGradient
                colors={["#1e293b", "#334155"]}
                style={styles.factsSectionContent}
              >
                <Text style={styles.factsTitle}>💡 Facts about them *</Text>
                {errors.facts && (
                  <Text style={styles.errorText}>{errors.facts}</Text>
                )}

                {formData.facts.map((fact, index) => (
                  <View key={index} style={styles.factRow}>
                    <Input
                      value={fact}
                      onChangeText={(text) => updateFact(index, text)}
                      placeholder={`Interesting fact #${index + 1}`}
                      containerStyle={styles.factInput}
                    />
                    {formData.facts.length > 1 && (
                      <Button
                        title="Remove"
                        onPress={() => removeFactField(index)}
                        variant="danger"
                        size="small"
                        style={styles.removeButton}
                      />
                    )}
                  </View>
                ))}

                <Button
                  title="+ Add Another Fact"
                  onPress={addFactField}
                  variant="ghost"
                  style={styles.addFactButton}
                />
              </LinearGradient>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={() => navigation.goBack()}
                variant="secondary"
                style={styles.cancelButton}
              />
              <Button
                title={loading ? "Adding..." : "Add Connection"}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#e2e8f0",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  factsSection: {
    marginBottom: 32,
  },
  factsSectionContent: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#474a57",
  },
  factsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#00f5ff",
    letterSpacing: 0.5,
  },
  factRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  factInput: {
    flex: 1,
    marginRight: 12,
    marginBottom: 0,
  },
  removeButton: {
    marginTop: 8,
    minWidth: 80,
  },
  addFactButton: {
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12,
    fontWeight: "500",
  },
});

export default AddConnectionScreen;
