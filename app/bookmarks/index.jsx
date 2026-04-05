import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList, LayoutAnimation,
    Modal,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../ThemeContext'; // <-- Add this import

const Bookmarks = () => {
    const { theme } = useTheme(); // <-- Use theme
    const [bookmarkedQuotes, setBookmarkedQuotes] = useState([]);

    const fetchBookmarkedQuotes = async () => {
        try {
            const existingBookmarks = await AsyncStorage.getItem('bookmarkedQuotes');
            const bookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
            setBookmarkedQuotes(bookmarks);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    useEffect(() => {
        fetchBookmarkedQuotes();
    }, []);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const router = useRouter();

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const openModal = (item) => {
        setSelectedQuote(item);
        setShowDeleteConfirm(false);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedQuote(null);
    };

    const animateButton = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.8,
            speed: 20,
            bounciness: 10,
            useNativeDriver: true,
        }).start(() => {
            Animated.spring(scaleAnim, {
                toValue: 1,
                speed: 20,
                bounciness: 10,
                useNativeDriver: true,
            }).start();
        });
    };

    const deleteBookmark = async (quoteToDelete) => {
        try {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            const indexToDelete = bookmarkedQuotes.findIndex( // To handle potential duplicates, we find the index of the first matching quote to delete.

                bookmark => bookmark.quote === quoteToDelete.quote && bookmark.author === quoteToDelete.author
            );

            if (indexToDelete > -1) {
                const updatedBookmarks = [...bookmarkedQuotes];
                updatedBookmarks.splice(indexToDelete, 1);

                setBookmarkedQuotes(updatedBookmarks);
                await AsyncStorage.setItem('bookmarkedQuotes', JSON.stringify(updatedBookmarks));

            }
            setShowDeleteConfirm(false);
            closeModal();
        } catch (error) {
            console.error('Error deleting bookmark:', error);
            Alert.alert('Error', 'Could not delete bookmark.');
        }
    };

    const confirmDelete = (quote) => {
        setShowDeleteConfirm(true);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.background }]}>
                <Text style={[styles.title, { color: theme.text }]}>Bookmarked Quotes</Text>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.centeredView}>
                    <View style={[styles.modalView, { backgroundColor: theme.container }]}>
                        {selectedQuote && (
                            <>
                                <Text style={[styles.modalQuote, { color: theme.text }]}>
                                    "{selectedQuote.quote}"
                                </Text>
                                <Text style={[styles.modalAuthor, { color: theme.text }]}>
                                    - {selectedQuote.author || 'Unknown'}
                                </Text>
                                <View style={styles.modalButtonContainer}>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <TouchableOpacity
                                            style={[styles.deleteButton, { backgroundColor: "#e74c3c" }]}
                                            onPress={() => confirmDelete(selectedQuote)}
                                            onPressIn={animateButton}
                                        >
                                            <AntDesign name="delete" size={24} color="white" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <TouchableOpacity
                                            style={[styles.shareButton, { backgroundColor: theme.button }]}
                                            onPress={() => setShowShareOptions(true)}
                                            onPressIn={animateButton}
                                        >
                                            <Ionicons name="share-social-outline" size={22} color={theme.buttonText} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <TouchableOpacity
                                            style={[styles.closeButton, { backgroundColor: theme.button }]}
                                            onPress={closeModal}
                                            onPressIn={animateButton}
                                        >
                                            <AntDesign name="close" size={24} color={theme.buttonText} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                                {showDeleteConfirm && (
                                    <View style={styles.deleteConfirmRow}>
                                        <Text style={[styles.deleteConfirmText, { color: theme.text }]}>Remove this bookmark?</Text>
                                        <View style={styles.deleteConfirmButtons}>
                                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.text }]} onPress={() => setShowDeleteConfirm(false)}>
                                                <Text style={{ color: theme.text }}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={[styles.confirmDeleteBtn, { backgroundColor: '#e74c3c' }]} onPress={() => deleteBookmark(selectedQuote)}>
                                                <Text style={{ color: '#fff' }}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
            <FlatList
                data={bookmarkedQuotes}
                keyExtractor={(item, index) => `${item.quote}-${index}`}
                contentContainerStyle={styles.listContentContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => openModal(item)}
                    >
                        <View style={[styles.bookmarkItem, { backgroundColor: theme.container }]}>
                            <Text style={[styles.bookmarkQuote, { color: theme.text }]} numberOfLines={3}>
                                "{item.quote}"
                            </Text>
                            <Text style={[styles.bookmarkAuthor, { color: theme.text }]}>
                                - {item.author || 'Unknown'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <AntDesign name="book" size={48} color="#ced4da" />
                        <Text style={[styles.emptyText, { color: theme.text }]}>No Bookmarks Yet</Text>
                        <Text style={[styles.emptySubtext, { color: theme.text }]}>
                            Your favorite quotes will appear here.
                        </Text>
                    </View>
                )}
            />
            <Modal transparent visible={showShareOptions} animationType="fade" onRequestClose={() => setShowShareOptions(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.container }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Share Quote</Text>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.button }]} onPress={async () => {
                            setShowShareOptions(false);
                            try { await Share.share({ message: `"${selectedQuote.quote}" - ${selectedQuote.author}` }); } catch (e) { console.error(e); }
                        }}>
                            <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Share just text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.button }]} onPress={async () => {
                            setShowShareOptions(false);
                            try { await AsyncStorage.setItem('pendingShare', JSON.stringify({ quote: selectedQuote.quote, author: selectedQuote.author })); } catch (e) { console.error(e); }
                            router.push('/share-quote');
                        }}>
                            <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Customize & share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setShowShareOptions(false)}>
                            <Text style={[styles.modalButtonText, { color: theme.text }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#3498db',
    },
    listContentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    bookmarkItem: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
    },
    bookmarkQuote: {
        fontSize: 18,
        fontStyle: 'italic',
        marginBottom: 10,
    },
    bookmarkAuthor: {
        fontSize: 16,
        textAlign: 'right',
        color: '#555',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalQuote: {
        fontSize: 22,
        fontStyle: 'italic',
        textAlign: 'center',
        marginBottom: 15,
    },
    modalAuthor: {
        fontSize: 18,
        textAlign: 'right',
        alignSelf: 'stretch',
        marginBottom: 20,
    },
    modalButtonContainer: { // Container to hold delete and close buttons horizontally
        flexDirection: 'row',  // Arrange buttons horizontally
        justifyContent: 'space-around',  // Distribute space around items
        marginTop: 20,  // Add some space above buttons
        width: '100%',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',  // Red background for delete
        padding: 12,
        borderRadius: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignItems: 'center',  // Center content horizontally
        justifyContent: 'center',  // Center content vertically
    },
    shareButton: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    closeButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 80,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#495057',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#6c757d',
        marginTop: 8,
        textAlign: 'center',
    },
    deleteConfirmRow: {
        marginTop: 16,
        width: '100%',
        alignItems: 'center',
    },
    deleteConfirmText: {
        fontSize: 16,
        marginBottom: 8,
    },
    deleteConfirmButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
    },
    cancelBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    confirmDeleteBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    modalAction: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 6,
    },
    modalCancel: {
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        borderRadius: 14,
        padding: 18,
        alignItems: 'center',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    modalButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 6,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Bookmarks;