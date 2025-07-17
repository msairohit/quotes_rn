import { router, Stack } from "expo-router";
import { useState } from "react";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "./ThemeContext";

export default function Index() {
  const { theme, themeName, setTheme, themes } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.background, { backgroundColor: theme.background }]}>
        <View style={[styles.container, { backgroundColor: theme.container }]}>
          <Image
            source={require("../assets/images/quotes-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.title, { color: theme.text }]}>Quotes App</Text>
          <Text style={[styles.description, { color: theme.text }]}>
            Discover inspiring quotes to brighten your day and share with friends.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={() => router.push("/quote")}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Get Quotes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={() => router.push("/bookmarks")}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>View Bookmarks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={() => router.push("/share-quote")}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Share Your Quote</Text>
            </TouchableOpacity>
            {/* Theme Switcher Dropdown */}
            <View style={{ marginTop: 10, alignItems: "center" }}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.button }]}
                onPress={() => setDropdownVisible(true)}
              >
                <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                  Theme: {themeName} ▼
                </Text>
              </TouchableOpacity>
              <Modal
                visible={dropdownVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
              >
                <View style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgba(0,0,0,0.3)"
                }}>
                  <View style={[styles.dropdownContainer, { backgroundColor: theme.container }]}>
                    <ScrollView style={{ width: "100%" }}>
                      {themes.map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setTheme(t);
                            setDropdownVisible(false);
                          }}
                        >
                          <Text style={{ color: theme.text, fontSize: 16, textAlign: "center", width: "100%" }}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 10,
    minWidth: 150,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  dropdownContent: {
    flexGrow: 1,
  },
  dropdownContainer: {
    maxHeight: 220,
    // minWidth: 180,
    width: 220,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  dropdownItem: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ensures item fills the dropdown width
  },
});
