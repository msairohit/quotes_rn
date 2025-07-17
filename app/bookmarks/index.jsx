import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList, LayoutAnimation,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const Bookmarks = () => {
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

    const scaleAnim = useRef(new Animated.Value(1)).current;

    const openModal = (item) => {
        setSelectedQuote(item);
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
            closeModal();
        } catch (error) {
            console.error('Error deleting bookmark:', error);
            Alert.alert('Error', 'Could not delete bookmark.');
        }
    };

    const confirmDelete = (quote) => {
        Alert.alert(
            'Delete Bookmark',
            'Are you sure you want to remove this bookmark?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteBookmark(quote), style: 'destructive' },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <Text style={styles.title}>Bookmarked Quotes</Text>
            </View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {selectedQuote && (
                            <>
                                <Text style={styles.modalQuote}>"{selectedQuote.quote}"</Text>
                                <Text style={styles.modalAuthor}>- {selectedQuote.author || 'Unknown'}</Text>
                                <View style={styles.modalButtonContainer}>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => confirmDelete(selectedQuote)}
                                            onPressIn={animateButton}
                                        >
                                            <AntDesign name="delete" size={24} color="white" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                        <TouchableOpacity
                                            style={styles.closeButton}
                                            onPress={closeModal}
                                            onPressIn={animateButton}
                                        >
                                            <AntDesign name="close" size={24} color="white" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
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
                        <View style={styles.bookmarkItem}>
                            <Text style={styles.bookmarkQuote} numberOfLines={3}>"{item.quote}"</Text>
                            <Text style={styles.bookmarkAuthor}>- {item.author || 'Unknown'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <AntDesign name="book" size={48} color="#ced4da" />
                        <Text style={styles.emptyText}>No Bookmarks Yet</Text>
                        <Text style={styles.emptySubtext}>Your favorite quotes will appear here.</Text>
                    </View>
                )}
            />
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
});

export default Bookmarks;