import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useTheme } from "./ThemeContext";

const screenWidth = Math.min(Dimensions.get("window").width, 340); // max 340 for design

export default function ShareQuote() {
    const { theme } = useTheme();
    const [name, setName] = useState("");
    const [photo, setPhoto] = useState(null);
    const [quote, setQuote] = useState("Loading...");
    const [author, setAuthor] = useState("");
    const [bgImage, setBgImage] = useState(null);
    const [loadingQuote, setLoadingQuote] = useState(false);
    const [loadingBg, setLoadingBg] = useState(false);
    const quoteCardRef = useRef(null);
    const [cardHeight, setCardHeight] = useState(220); // default minimum

    useEffect(() => { fetchQuote(); }, []);

    const fetchQuote = async () => {
        setLoadingQuote(true);
        try {
            const response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en');
            const data = await response.json();
            setQuote(data.quoteText);
            setAuthor(data.quoteAuthor);
        } catch {
            setQuote("Stay positive and keep moving forward!");
            setAuthor("Unknown");
        }
        setLoadingQuote(false);
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

    const addBackgroundImage = async () => {
        setLoadingBg(true);
        try {
            const unsplashUrl = `https://source.unsplash.com/featured/${screenWidth}x${Math.round(cardHeight)}/?motivation,success,life`;
            const response = await fetch(unsplashUrl, { method: "HEAD" });
            if (response.ok) {
                setBgImage(unsplashUrl);
                return;
            }
            throw new Error("Unsplash failed");
        } catch {
            setBgImage(`https://picsum.photos/${screenWidth}/${Math.round(cardHeight)}?random=${Math.floor(Math.random() * 10000)}`);
        }
    };

    const pickBackgroundImage = async () => {
        setLoadingBg(true);
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [screenWidth, cardHeight],
            quality: 1,
        });
        if (!result.canceled) {
            setBgImage(result.assets[0].uri);
            // Don't setLoadingBg(false) here!
        } else {
            setLoadingBg(false); // Only if user cancels
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
                <TouchableOpacity
                    style={[styles.bgButton, { backgroundColor: theme.button }]}
                    onPress={addBackgroundImage}
                    disabled={loadingBg}
                >
                    <Text style={[styles.bgButtonText, { color: theme.buttonText }]}>
                        {loadingBg ? "Loading..." : "Add Random Background"}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.bgButton, { backgroundColor: theme.button }]}
                    onPress={pickBackgroundImage}
                    disabled={loadingBg}
                >
                    <Text style={[styles.bgButtonText, { color: theme.buttonText }]}>
                        {loadingBg ? "Loading..." : "Pick Your Own Background"}
                    </Text>
                </TouchableOpacity>
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
                    onLayout={e => setCardHeight(e.nativeEvent.layout.height)}
                >
                    {loadingBg && (
                        <View style={styles.loaderOverlay}>
                            <ActivityIndicator size="large" color={theme.button} />
                        </View>
                    )}
                    {bgImage && cardHeight > 0 && (
                        <Image
                            source={{ uri: bgImage }}
                            style={[styles.cardBgImage, { height: cardHeight }]}
                            resizeMode="cover"
                            onLoadEnd={() => setLoadingBg(false)}
                        />
                    )}
                    <View style={styles.cardOverlay}>
                        {photo && (
                            <View style={styles.cardPhotoContainer}>
                                <Image source={{ uri: photo }} style={styles.cardPhoto} />
                            </View>
                        )}
                        <Text style={[styles.cardName, { color: theme.text }]}>{name}</Text>
                        <Text style={[styles.cardLabel, { color: theme.text }]}>Quote:</Text>
                        {loadingQuote ? (
                            <ActivityIndicator size="small" color={theme.button} style={{ marginVertical: 10 }} />
                        ) : (
                            <>
                                <Text style={[styles.cardQuote, { color: theme.text }]}>"{quote}"</Text>
                                <Text style={[styles.cardAuthor, { color: theme.text }]}>- {author}</Text>
                            </>
                        )}
                    </View>
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
    bgButton: {
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginBottom: 16,
        elevation: 2,
    },
    bgButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
        letterSpacing: 0.5,
    },
    quoteCard: {
        width: screenWidth,
        // height: cardHeight, // REMOVE this line
        // minHeight: 220,       // Add a minimum height
        borderRadius: 18,
        padding: 18,
        alignItems: "center",
        marginBottom: 24,
        borderWidth: 2,
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    cardBgImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: screenWidth,
        borderRadius: 18,
        opacity: 0.35,
    },
    cardOverlay: {
        // flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
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
    loaderOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        borderRadius: 18,
    },
    cardPhotoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f3f3",
        borderWidth: 2,
        borderColor: "#ddd",
        overflow: "hidden",
    },
    cardPhotoPlaceholder: {
        fontSize: 14,
        textAlign: "center",
        opacity: 0.6,
    },
});