import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronRight, Globe, Search, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BibleBook, BibleChapter, BibleSearchResult, bibleService, BibleTranslation } from '../../services/bibleService';

export default function BibleScreen() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [favoriteVerses, setFavoriteVerses] = useState<BibleSearchResult[]>([]);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [translations, setTranslations] = useState<BibleTranslation[]>([]);
  const [selectedTranslation, setSelectedTranslation] = useState<string>('web');
  const [currentChapter, setCurrentChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);

  // Load Bible data
  useEffect(() => {
    loadBibleData();
  }, []);

  const loadBibleData = async () => {
    try {
      setLoading(true);
      console.log('📖 Loading Bible data...');
      
      // Load translations and books in parallel
      const [translationsData, booksData] = await Promise.all([
        bibleService.getAvailableTranslations(),
        bibleService.getBooks(selectedTranslation)
      ]);
      
      setTranslations(translationsData);
      setBibleBooks(booksData);
      console.log('✅ Bible data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading Bible data:', error);
      Alert.alert('Error', 'Failed to load Bible data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter(1);
    setCurrentChapter(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      console.log(`🔍 Searching for: "${searchQuery}"`);
      const results = await bibleService.searchVerses(searchQuery, selectedTranslation, 20);
      setSearchResults(results);
      setShowSearch(true);
    } catch (error) {
      console.error('❌ Error searching verses:', error);
      Alert.alert('Search Error', 'Failed to search Bible verses. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChapterSelect = async (chapter: number) => {
    if (!selectedBook) return;
    
    setSelectedChapter(chapter);
    try {
      console.log(`📖 Loading chapter: ${selectedBook} ${chapter}`);
      const chapterData = await bibleService.getChapter(selectedTranslation, selectedBook, chapter);
      setCurrentChapter(chapterData);
    } catch (error) {
      console.error('❌ Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load chapter. Please try again.');
    }
  };

  const handleTranslationChange = async (translationId: string) => {
    setSelectedTranslation(translationId);
    setShowTranslations(false);
    try {
      console.log(`🔄 Changing translation to: ${translationId}`);
      const books = await bibleService.getBooks(translationId);
      setBibleBooks(books);
    } catch (error) {
      console.error('❌ Error loading books for translation:', error);
    }
  };

  const addToFavorites = (verse: BibleSearchResult) => {
    setFavoriteVerses(prev => [...prev, verse]);
    Alert.alert('Added to Favorites', 'Verse added to your favorites');
  };

  const getCurrentTranslation = () => {
    return translations.find(t => t.id === selectedTranslation) || translations[0];
  };

  const renderBooks = () => {
    const oldTestament = bibleBooks.filter(book => book.testament === 'old');
    const newTestament = bibleBooks.filter(book => book.testament === 'new');

    return (
      <View style={styles.booksContainer}>
        {/* Old Testament */}
        <View style={styles.testamentSection}>
          <View style={styles.testamentHeader}>
            <Text style={styles.testamentTitle}>Old Testament</Text>
            <Text style={styles.testamentSubtitle}>{oldTestament.length} books</Text>
          </View>
          <View style={styles.booksGrid}>
            {oldTestament.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                onPress={() => handleBookSelect(book.id)}>
                <View style={styles.bookCardContent}>
                  <Text style={styles.bookName}>{book.name}</Text>
                  <Text style={styles.bookChapters}>{book.chapters} chapters</Text>
                </View>
                <ChevronRight size={16} color="#c9a961" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* New Testament */}
        <View style={styles.testamentSection}>
          <View style={styles.testamentHeader}>
            <Text style={styles.testamentTitle}>New Testament</Text>
            <Text style={styles.testamentSubtitle}>{newTestament.length} books</Text>
          </View>
          <View style={styles.booksGrid}>
            {newTestament.map((book) => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookCard}
                onPress={() => handleBookSelect(book.id)}>
                <View style={styles.bookCardContent}>
                  <Text style={styles.bookName}>{book.name}</Text>
                  <Text style={styles.bookChapters}>{book.chapters} chapters</Text>
                </View>
                <ChevronRight size={16} color="#c9a961" strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderChapters = () => {
    const book = bibleBooks.find(b => b.id === selectedBook);
    if (!book) return null;

    const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

    return (
      <View style={styles.chaptersContainer}>
        <View style={styles.chapterHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBook(null)}>
            <ArrowLeft size={20} color="#c9a961" strokeWidth={2} />
            <Text style={styles.backButtonText}>Back to Books</Text>
          </TouchableOpacity>
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.name}</Text>
            <Text style={styles.bookSubtitle}>{book.chapters} chapters • {getCurrentTranslation()?.name}</Text>
          </View>
        </View>

        <View style={styles.chaptersGrid}>
          {chapters.map((chapter) => (
            <TouchableOpacity
              key={chapter}
              style={[
                styles.chapterCard,
                selectedChapter === chapter && styles.selectedChapterCard
              ]}
              onPress={() => handleChapterSelect(chapter)}>
              <Text style={[
                styles.chapterNumber,
                selectedChapter === chapter && styles.selectedChapterNumber
              ]}>
                {chapter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChapterContent = () => {
    if (!currentChapter) return null;

    return (
      <View style={styles.chapterContentContainer}>
        <View style={styles.chapterContentHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentChapter(null)}>
            <ArrowLeft size={20} color="#c9a961" strokeWidth={2} />
            <Text style={styles.backButtonText}>Back to Chapters</Text>
          </TouchableOpacity>
          <View style={styles.chapterInfo}>
            <Text style={styles.chapterTitle}>
              {bibleBooks.find(b => b.id === selectedBook)?.name} Chapter {currentChapter.chapterNumber}
            </Text>
            <Text style={styles.chapterSubtitle}>
              {currentChapter.verses.length} verses • {getCurrentTranslation()?.name}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.versesContainer} showsVerticalScrollIndicator={false}>
          {currentChapter.verses.map((verse, index) => (
            <View key={index} style={styles.verseContainer}>
              <Text style={styles.verseNumber}>{verse.verseNumber}</Text>
              <Text style={styles.verseText}>{verse.text}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSearchResults = () => {
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchHeader}>
          <TouchableOpacity style={styles.backButton} onPress={() => {
            setSearchQuery('');
            setShowSearch(false);
            setSearchResults([]);
          }}>
            <ArrowLeft size={20} color="#c9a961" strokeWidth={2} />
            <Text style={styles.backButtonText}>Back to Bible</Text>
          </TouchableOpacity>
          <Text style={styles.searchTitle}>Search Results</Text>
        </View>

        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#c9a961" />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            {searchResults.map((verse, index) => (
              <View key={index} style={styles.verseCard}>
                <View style={styles.verseHeader}>
                  <Text style={styles.verseReference}>
                    {verse.bookName} {verse.chapterNumber}:{verse.verseNumber}
                  </Text>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => addToFavorites(verse)}>
                    <Star size={16} color="#c9a961" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.verseText}>{verse.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No results found</Text>
            <Text style={styles.emptySubtext}>Try different search terms</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/church-background.jpg')}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}>
        <LinearGradient
          colors={['rgba(15,15,15,0.9)', 'rgba(15,15,15,0.95)']}
          style={styles.gradient}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Bible</Text>
              <Text style={styles.headerSubtitle}>{getCurrentTranslation()?.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowTranslations(!showTranslations)}>
                <Globe size={20} color="#c9a961" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setShowSearch(!showSearch)}>
                <Search size={20} color="#c9a961" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

            {/* Search Interface */}
            {showSearch && (
              <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color="#666666" strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search Bible verses..."
                    placeholderTextColor="#666666"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                    autoFocus
                  />
                  <TouchableOpacity 
                    style={styles.searchSubmitButton} 
                    onPress={handleSearch}
                    disabled={!searchQuery.trim()}>
                    <Text style={[
                      styles.searchSubmitText,
                      !searchQuery.trim() && styles.searchSubmitTextDisabled
                    ]}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Translation Selector */}
            {showTranslations && (
              <View style={styles.translationSelector}>
                <Text style={styles.translationLabel}>Choose Translation</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.translationScroll}>
                  {translations.map((translation) => (
                    <TouchableOpacity
                      key={translation.id}
                      style={[
                        styles.translationButton,
                        selectedTranslation === translation.id && styles.selectedTranslationButton
                      ]}
                      onPress={() => handleTranslationChange(translation.id)}>
                      <Text style={[
                        styles.translationButtonText,
                        selectedTranslation === translation.id && styles.selectedTranslationButtonText
                      ]}>
                        {translation.abbreviation}
                      </Text>
                      <Text style={[
                        styles.translationButtonSubtext,
                        selectedTranslation === translation.id && styles.selectedTranslationButtonSubtext
                      ]}>
                        {translation.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Loading State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#c9a961" />
                <Text style={styles.loadingText}>Loading Bible...</Text>
              </View>
            ) : (
              /* Content */
              currentChapter ? (
                renderChapterContent()
              ) : showSearch && searchQuery ? (
                renderSearchResults()
              ) : selectedBook ? (
                renderChapters()
              ) : (
                renderBooks()
              )
            )}
          </ScrollView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'Playfair-Bold',
    fontSize: 28,
    color: '#ffffff',
  },
  headerSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#c9a961',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 169, 97, 0.2)',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
  },
  searchSubmitButton: {
    backgroundColor: '#c9a961',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchSubmitText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  searchSubmitTextDisabled: {
    color: '#666666',
  },
  booksContainer: {
    paddingHorizontal: 20,
  },
  testamentSection: {
    marginBottom: 32,
  },
  testamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  testamentTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#ffffff',
  },
  testamentSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#c9a961',
  },
  booksGrid: {
    gap: 12,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  bookCardContent: {
    flex: 1,
  },
  bookName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 4,
  },
  bookChapters: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#c9a961',
  },
  chaptersContainer: {
    paddingHorizontal: 20,
  },
  chapterHeader: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#c9a961',
  },
  bookInfo: {
    marginTop: 8,
  },
  bookTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  bookSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#c9a961',
    marginTop: 4,
  },
  chaptersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  chapterCard: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  selectedChapterCard: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  chapterNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
  },
  selectedChapterNumber: {
    color: '#000000',
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchHeader: {
    marginBottom: 20,
  },
  searchTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#999999',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#999999',
  },
  resultsContainer: {
    gap: 16,
  },
  verseCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verseReference: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#c9a961',
  },
  favoriteButton: {
    padding: 4,
  },
  translationSelector: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  translationLabel: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
  },
  translationScroll: {
    flexDirection: 'row',
  },
  translationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  selectedTranslationButton: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  translationButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#cccccc',
  },
  selectedTranslationButtonText: {
    color: '#000000',
  },
  translationButtonSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#999999',
    marginTop: 2,
  },
  selectedTranslationButtonSubtext: {
    color: '#666666',
  },
  chapterContentContainer: {
    flex: 1,
  },
  chapterContentHeader: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  chapterInfo: {
    marginTop: 8,
  },
  chapterTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#ffffff',
  },
  chapterSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#c9a961',
    marginTop: 4,
  },
  versesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  verseContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  verseNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#c9a961',
    marginRight: 12,
    minWidth: 30,
  },
  verseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    flex: 1,
  },
});