import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
const App = () => {
    const [quote, setQuote] = useState('Loading...');
    const [author, setAuthor] = useState('');
    const [bookmarkedQuotes, setBookmarkedQuotes] = useState([]);
    // Fetch a random quote
    const fetchQuote = async () => {
        try {
            const response = await fetch('https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en');
            // https://api.animechan.io/v1/quotes/random?anime=ReLife
            const data = await response.json();
            setQuote(data.quoteText);
            setAuthor(data.quoteAuthor);
            // secondQuote();
        } catch (error) {
            console.error(error);
        }
    };

    const secondQuote = async () => {
        try {
            console.log("image quote")
            const response = await fetch('https://quotesondesign.com/wp-json/wp/v2/posts/?per_page=1');
            const data = await response.json();
            console.log(data[0])
            const quote = data[0].content.rendered
                .replace(/<\/?p>/g, '')
                .replace(/^"|"$/g, '');
            const author = data[0].title.rendered;
            const image = data[0].featured_media; // Image ID
            console.log(quote)
            console.log(image);
            setQuote(quote);
            setAuthor(author);
        } catch (error) {
            console.error(error);
        }
    }
    // Bookmark the current quote
    const bookmarkQuote = async () => {
        const newBookmark = { quote, author };
        try {
            const existingBookmarks = await AsyncStorage.getItem('bookmarkedQuotes');
            const bookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
            bookmarks.push(newBookmark);
            await AsyncStorage.setItem('bookmarkedQuotes', JSON.stringify(bookmarks));
            Alert.alert('Success', 'Quote bookmarked!');
            fetchBookmarkedQuotes(); // Refresh the bookmarked quotes
        } catch (error) {
            console.error('Error saving bookmark:', error);
        }
    };
    // Share the current quote
    const shareQuote = async () => {
        try {
            await Share.share({
                message: `"${quote}" - ${author}`,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share the quote.');
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
    useEffect(() => {
        fetchQuote();
        fetchBookmarkedQuotes(); // Load bookmarks on app start
    }, []);
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View>
                <Text style={styles.title}>Quotess</Text>
            </View>
            <View style={styles.quoteBox}>
                <Text style={styles.quote}>"{quote}"</Text>
                <Text style={styles.author}>- {author}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={fetchQuote}>
                    <Text style={styles.buttonText}>New Quote</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={bookmarkQuote}>
                    <Text style={styles.buttonText}>Bookmark</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={shareQuote}>
                    <Text style={styles.buttonText}>Share</Text>
                </TouchableOpacity>
            </View>
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
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    bookmarkedTitle: {
        fontSize: 20,
    },
    title: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 16,
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#3498db',
    },

});
export default App;