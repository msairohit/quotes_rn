import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useTheme } from "./ThemeContext";

export default function ShareQuote() {
    const { theme } = useTheme();
    const [name, setName] = useState("");
    const [photo, setPhoto] = useState(null);
    const [quote, setQuote] = useState("Loading...");
    const [author, setAuthor] = useState("");
    const quoteCardRef = useRef(null);

    useEffect(() => { fetchQuote(); }, []);

    const fetchQuote = async () => {
        try {
            const response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en');
            const data = await response.json();
            setQuote(data.quoteText);
            setAuthor(data.quoteAuthor);
        } catch {
            setQuote("Stay positive and keep moving forward!");
            setAuthor("Unknown");
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const shareQuoteCard = async () => {
        try {
            const uri = await captureRef(quoteCardRef.current, {
                format: "png",
                quality: 1,
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert("Error", "Could not share the image.");
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.screen, { backgroundColor: theme.background }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Share Your Quote</Text>
            </View>
            <View style={styles.content}>
                <TouchableOpacity style={[styles.photoPicker, { borderColor: theme.button }]} onPress={pickImage}>
                    {photo ? (
                        <Image source={{ uri: photo }} style={styles.photo} />
                    ) : (
                        <Text style={{ color: theme.text, textAlign: "center" }}>Tap to upload photo</Text>
                    )}
                </TouchableOpacity>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.text,
                            borderColor: theme.button,
                            backgroundColor: theme.container,
                        },
                    ]}
                    placeholder="Enter your name or message"
                    placeholderTextColor={theme.text}
                    value={name}
                    onChangeText={setName}
                />
                <View
                    style={[
                        styles.quoteCard,
                        {
                            backgroundColor: theme.container,
                            borderColor: theme.button,
                            shadowColor: theme.button,
                        },
                    ]}
                    ref={quoteCardRef}
                    collapsable={false}
                >
                    {photo && <Image source={{ uri: photo }} style={styles.cardPhoto} />}
                    <Text style={[styles.cardName, { color: theme.text }]}>{name}</Text>
                    <Text style={[styles.cardLabel, { color: theme.text }]}>Quote:</Text>
                    <Text style={[styles.cardQuote, { color: theme.text }]}>"{quote}"</Text>
                    <Text style={[styles.cardAuthor, { color: theme.text }]}>- {author}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.shareButton, { backgroundColor: theme.button }]}
                    onPress={shareQuoteCard}
                >
                    <Text style={[styles.shareButtonText, { color: theme.buttonText }]}>Share</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingTop: 32,
        paddingHorizontal: 0,
    },
    header: {
        marginBottom: 12,
        alignItems: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 1,
    },
    content: {
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    photoPicker: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#eee",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        overflow: "hidden",
        borderWidth: 2,
    },
    photo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: "cover",
    },
    input: {
        borderWidth: 2,
        borderRadius: 12,
        padding: 12,
        width: "90%",
        marginBottom: 18,
        fontSize: 16,
    },
    quoteCard: {
        width: "100%",
        maxWidth: 340,
        minHeight: 220,
        borderRadius: 18,
        padding: 18,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 2,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        backgroundColor: "#fff",
    },
    cardPhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: "#ddd",
    },
    cardName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 4,
        textAlign: "center",
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
        textAlign: "center",
    },
    cardQuote: {
        fontSize: 18,
        fontStyle: "italic",
        textAlign: "center",
        marginBottom: 8,
        marginTop: 2,
    },
    cardAuthor: {
        fontSize: 15,
        textAlign: "right",
        alignSelf: "stretch",
        marginTop: 4,
        opacity: 0.7,
    },
    shareButton: {
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 40,
        marginTop: 8,
        elevation: 2,
    },
    shareButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 0.5,
    },
});