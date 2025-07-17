import { router, Stack } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.background}>
        <View style={styles.container}>
          <Image
            source={require("../assets/images/quotes-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Quotes App</Text>
          <Text style={styles.description}>
            Discover inspiring quotes to brighten your day and share with friends.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.getQuoteButton]}
              onPress={() => router.push("/quote")}
            >
              <Text style={styles.buttonText}>Get Quotes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.viewBookmarksButton]}
              onPress={() => router.push("/bookmarks")}
            >
              <Text style={styles.buttonText}>View Bookmarks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background color
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
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
    color: "white",
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
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  getQuoteButton: {
    backgroundColor: "#3498db", // Blue
  },
  viewBookmarksButton: {
    backgroundColor: "#2ecc71", // Green
  },
});
