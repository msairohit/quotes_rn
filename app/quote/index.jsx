import { Ionicons } from '@expo/vector-icons'; // Import icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Modal, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../ThemeContext';

const App = () => {
    const { theme } = useTheme();
    const router = useRouter();
    const [quote, setQuote] = useState('Loading...');
    const [author, setAuthor] = useState('');
    const [bookmarkedQuotes, setBookmarkedQuotes] = useState([]);
    const [cache, setCache] = useState([]); // stored quotes collection
    const [cacheIndex, setCacheIndex] = useState(-1);
    const [showToast, setShowToast] = useState(false);
    const [toastText, setToastText] = useState('');
    const [showShareOptions, setShowShareOptions] = useState(false);
    // Fetch a random quote
    const fetchNewQuote = async () => {
        try {
            const response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en');
            const data = await response.json();
            return { quote: data.quoteText, author: data.quoteAuthor };
        } catch (error) {
            console.log('Could not fetch a quote. Trying another source...');
            return await secondQuote();
        }
    };

    const secondQuote = async () => {
        try {
            const response = await fetch('https://quotesondesign.com/wp-json/wp/v2/posts/?per_page=1');
            const data = await response.json();
            const q = data[0].content.rendered
                .replace(/<\/?p>/g, '')
                .replace(/^"|"$/g, '');
            const a = data[0].title.rendered;
            return { quote: q, author: a };
        } catch (error) {
            console.error(error);
            return { quote: 'Stay positive and keep moving forward!', author: 'Unknown' };
        }
    };
    // Bookmark the current quote
    const toggleBookmark = async () => {
        try {
            const existing = await AsyncStorage.getItem('bookmarkedQuotes');
            const bookmarks = existing ? JSON.parse(existing) : [];
            const matchIndex = bookmarks.findIndex(b => b.quote === quote && b.author === author);
            let message = '';
            if (matchIndex >= 0) {
                bookmarks.splice(matchIndex, 1);
                message = 'Removed from bookmarks';
            } else {
                bookmarks.push({ quote, author });
                message = 'Bookmarked';
            }
            await AsyncStorage.setItem('bookmarkedQuotes', JSON.stringify(bookmarks));
            setBookmarkedQuotes(bookmarks);
            showTransientToast(message);
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };
    // Share the current quote
    const shareQuote = async () => {
        try {
            await Share.share({
                message: `"${quote}" - ${author}`,
            });
        } catch (error) {
            showTransientToast('Could not share the quote');
        }
    };
    // Fetch bookmarked quotes
    const fetchBookmarkedQuotes = async () => {
        try {
            const existingBookmarks = await AsyncStorage.getItem('bookmarkedQuotes');
            const bookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
            setBookmarkedQuotes(bookmarks);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
        }
    };

    const fetchCache = async () => {
        try {
            const cached = await AsyncStorage.getItem('quoteCache');
            const parsed = cached ? JSON.parse(cached) : [];
            setCache(parsed);
            if (parsed.length > 0) {
                setCacheIndex(parsed.length - 1);
                setQuote(parsed[parsed.length - 1].quote);
                setAuthor(parsed[parsed.length - 1].author);
            } else {
                // no cache, fetch a new quote and seed it
                const q = await fetchNewQuote();
                pushToCache(q.quote, q.author);
            }
        } catch (error) {
            console.error('Error loading cache:', error);
        }
    };

    const pushToCache = async (q, a) => {
        try {
            const next = [...cache, { quote: q, author: a }];
            await AsyncStorage.setItem('quoteCache', JSON.stringify(next));
            setCache(next);
            setCacheIndex(next.length - 1);
            setQuote(q);
            setAuthor(a);
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    };

    const handleNext = async () => {
        if (cacheIndex < cache.length - 1) {
            const nextIndex = cacheIndex + 1;
            setCacheIndex(nextIndex);
            setQuote(cache[nextIndex].quote);
            setAuthor(cache[nextIndex].author);
            return;
        }
        const q = await fetchNewQuote();
        pushToCache(q.quote, q.author);
    };

    const handlePrev = () => {
        if (cacheIndex > 0) {
            const prevIndex = cacheIndex - 1;
            setCacheIndex(prevIndex);
            setQuote(cache[prevIndex].quote);
            setAuthor(cache[prevIndex].author);
        } else {
            showTransientToast('No previous quote');
        }
    };

    const showTransientToast = (text) => {
        setToastText(text);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1600);
    };
    useEffect(() => {
        fetchCache();
        fetchBookmarkedQuotes(); // Load bookmarks on app start
    }, []);
    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View>
                <Text style={[styles.title, { color: theme.text }]}>Quotes</Text>
            </View>
            <View style={[styles.quoteBox, { backgroundColor: theme.container }]}>
                <Text style={[styles.quote, { color: theme.text }]}>{quote ? `"${quote}"` : '"Loading..."'}</Text>
                <Text style={[styles.author, { color: theme.text }]}>- {author}</Text>
            </View>
            <View style={styles.controlsRow}>
                <TouchableOpacity style={styles.iconButton} onPress={handlePrev}>
                    <Ionicons name="chevron-back-circle-outline" size={48} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={toggleBookmark}>
                    <Ionicons name={bookmarkedQuotes.find(b => b.quote === quote && b.author === author) ? 'bookmark' : 'bookmark-outline'} size={40} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={() => setShowShareOptions(true)}>
                    <Ionicons name="share-social-outline" size={40} color={theme.tint} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={handleNext}>
                    <Ionicons name="chevron-forward-circle-outline" size={48} color={theme.tint} />
                </TouchableOpacity>
            </View>

            <Modal transparent visible={showShareOptions} animationType="fade" onRequestClose={() => setShowShareOptions(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.container }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Share Quote</Text>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.button }]} onPress={() => { setShowShareOptions(false); shareQuote(); }}>
                            <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Share just text</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, { backgroundColor: theme.button }]} onPress={async () => {
                            setShowShareOptions(false);
                            try {
                                await AsyncStorage.setItem('pendingShare', JSON.stringify({ quote, author }));
                            } catch (e) {
                                console.error('Could not save pending share', e);
                            }
                            router.push('/share-quote');
                        }}>
                            <Text style={[styles.modalButtonText, { color: theme.buttonText }]}>Customize & share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalCancel} onPress={() => setShowShareOptions(false)}>
                            <Text style={[styles.modalButtonText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {showToast && (
                <View style={[styles.toast, { backgroundColor: theme.button }]}>
                    <Text style={[styles.toastText, { color: theme.buttonText }]}>{toastText}</Text>
                </View>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e8f5e9', // Light green background
        padding: 20,
    },
    quoteBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    quote: {
        fontSize: 24,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    author: {
        fontSize: 18,
        textAlign: 'right',
        marginTop: 10,
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 20,
    },
    iconButton: {
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
    },
    bookmarkedTitle: {
        fontSize: 20,
    },
    title: {
        // paddingTop: 60,
        paddingBottom: 20,
        marginTop: 20,
        paddingHorizontal: 16,
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        // color: '#3498db',
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginBottom: 12,
        alignItems: 'center',
    },
    prevNextButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 18,
        alignItems: 'center',
    },
    customizeButton: {
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        alignSelf: 'center',
        elevation: 2,
    },
    customizeText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    toast: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        elevation: 6,
    },
    toastText: {
        fontSize: 14,
        fontWeight: '600',
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
    modalCancel: {
        marginTop: 6,
        paddingVertical: 8,
    },

});
export default App;