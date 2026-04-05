import { router, Stack } from "expo-router";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "./ThemeContext";

export default function Index() {
  const { theme, themeName, setTheme, themes } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // helper: map theme name to a representative color swatch
  const themesMapColor = (name: string) => {
    const map: Record<string, string> = {
      Light: '#ffffff',
      Dark: '#333333',
      Blue: '#1976d2',
      Green: '#388e3c',
      Red: '#d32f2f',
      Purple: '#8e24aa',
      Orange: '#fb8c00',
      Pink: '#d81b60',
      Gray: '#757575',
      Teal: '#00796b',
    };
    return map[name] || '#999';
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.background, { backgroundColor: theme.background }]}>
        <View style={[styles.container, { backgroundColor: theme.container }]}>
          <Text style={[styles.title, { color: theme.text, fontSize: 32, marginBottom: 20 }]}>Quotes</Text>
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
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Share customized Quote</Text>
            </TouchableOpacity>
            {/* Theme Switcher Dropdown */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={[styles.buttonText, { color: theme.buttonText }]}>Theme: {themeName} ▼</Text>
            </TouchableOpacity>
            <Modal
              visible={dropdownVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}
            >
              <View style={styles.modalBackdrop}>
                <View style={[styles.modalCard, { backgroundColor: theme.container }]}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>Select Theme</Text>
                    <TouchableOpacity onPress={() => setDropdownVisible(false)} style={styles.closeButton}>
                      <Text style={{ color: theme.text, fontSize: 18 }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.themeGrid}>
                    {themes.map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.themeOption, { borderColor: themeName === t ? theme.button : 'transparent' }]}
                        onPress={() => {
                          setTheme(t);
                          setDropdownVisible(false);
                        }}
                      >
                        <View style={[styles.swatch, { backgroundColor: themesMapColor(t) }]} />
                        <Text style={[styles.optionLabel, { color: theme.text }]}>{t}</Text>
                        {themeName === t && <Text style={[styles.check, { color: theme.button }]}>✓</Text>}
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity style={[styles.footerButton, { backgroundColor: theme.button }]} onPress={() => setDropdownVisible(false)}>
                      <Text style={[styles.buttonText, { color: theme.buttonText }]}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
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
    paddingHorizontal: 16,
    marginBottom: 12,
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    // text color is applied inline from theme
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 30,
    width: '100%'
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
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  modalCard: {
    width: 340,
    borderRadius: 14,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 6,
    top: -2,
    padding: 6,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  themeOption: {
    width: '48%',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  check: {
    position: 'absolute',
    right: 8,
    top: 8,
    fontSize: 16,
    fontWeight: '700'
  },
  modalFooter: {
    marginTop: 8,
    alignItems: 'center'
  },
  footerButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: 'center'
  },
});
