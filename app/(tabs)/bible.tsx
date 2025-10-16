import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ChevronRight, Globe, Search, Star } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BibleBook, BibleChapter, BibleSearchResult, bibleService, BibleTranslation } from '../../services/bibleService';

export default function BibleScreen() {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
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
  const scrollViewRef = useRef<ScrollView>(null);
  const mainScrollViewRef = useRef<ScrollView>(null);
  const [versePositions, setVersePositions] = useState<{[key: number]: number}>({});

  // Load Bible data
  useEffect(() => {
    loadBibleData();
  }, []);

  // Scroll to selected verse when it changes
  useEffect(() => {
    if (selectedVerse && currentChapter && mainScrollViewRef.current) {
      const verseIndex = currentChapter.verses.findIndex(v => v.verseNumber === selectedVerse);
      if (verseIndex !== -1) {
        console.log(`📖 Scrolling to verse ${selectedVerse} (index: ${verseIndex})`);
        
        // Use measured position if available, otherwise use fallback
        const measuredPosition = versePositions[selectedVerse];
        const fallbackPosition = verseIndex * 120; // Fallback calculation
        const targetY = measuredPosition !== undefined ? measuredPosition : fallbackPosition;
        
        console.log(`📖 Measured position: ${measuredPosition}, Fallback: ${fallbackPosition}, Using: ${targetY}`);
        
        // Robust scrolling with multiple attempts
        setTimeout(() => {
          console.log(`📖 Attempt 1: Direct scroll to ${targetY}`);
          mainScrollViewRef.current?.scrollTo({
            y: targetY,
            animated: false
          });
        }, 100);
        
        // Backup attempt with slight adjustment
        setTimeout(() => {
          const adjustedY = targetY - 20; // Slight offset to ensure verse is at top
          console.log(`📖 Attempt 2: Adjusted scroll to ${adjustedY}`);
          mainScrollViewRef.current?.scrollTo({
            y: Math.max(0, adjustedY),
            animated: false
          });
        }, 500);
      }
    }
  }, [selectedVerse, currentChapter, versePositions]);

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
      
      // First, try to parse as verse reference
      const parsed = parseVerseReference(searchQuery);
      
      if (parsed) {
        console.log(`📖 Detected verse reference: ${parsed.bookName} ${parsed.chapter}:${parsed.verse}`);
        
        // Find the book
        const book = bibleBooks.find(b => 
          b.name.toLowerCase().includes(parsed.bookName) ||
          b.id.toLowerCase() === parsed.bookName.toLowerCase()
        );
        
        if (book) {
          console.log(`📖 Found book: ${book.name} (${book.id})`);
          
          // Load the chapter
          setSelectedBook(book.id);
          setSelectedChapter(parsed.chapter);
          setSelectedVerse(parsed.verse);
          setSearchQuery('');
          setShowSearch(false);
          
          // Load chapter data
          const chapterData = await bibleService.getChapter(selectedTranslation, book.id, parsed.chapter);
          setCurrentChapter(chapterData);
          
          console.log(`✅ Loaded ${book.name} ${parsed.chapter}:${parsed.verse}`);
          return;
        } else {
          Alert.alert('Book Not Found', `Could not find book: ${parsed.bookName}`);
          return;
        }
      }
      
      // If not a verse reference, perform text search
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

  // Book name mappings for short forms
  const bookNameMappings: {[key: string]: string} = {
    // Old Testament
    'gen': 'genesis', 'exo': 'exodus', 'lev': 'leviticus', 'num': 'numbers', 'deu': 'deuteronomy',
    'jos': 'joshua', 'judg': 'judges', 'rut': 'ruth', '1sa': '1 samuel', '2sa': '2 samuel',
    '1ki': '1 kings', '2ki': '2 kings', '1ch': '1 chronicles', '2ch': '2 chronicles',
    '1chro': '1 chronicles', '2chro': '2 chronicles', 'chro': 'chronicles',
    'ezr': 'ezra', 'neh': 'nehemiah', 'est': 'esther', 'job': 'job', 'psa': 'psalms',
    'ps': 'psalms', 'pro': 'proverbs', 'ecc': 'ecclesiastes', 'sos': 'song of solomon',
    'isa': 'isaiah', 'jer': 'jeremiah', 'lam': 'lamentations', 'eze': 'ezekiel',
    'dan': 'daniel', 'hos': 'hosea', 'joe': 'joel', 'amo': 'amos', 'oba': 'obadiah',
    'jon': 'jonah', 'mic': 'micah', 'nah': 'nahum', 'hab': 'habakkuk', 'zep': 'zephaniah',
    'hag': 'haggai', 'zec': 'zechariah', 'mal': 'malachi',
    
    // New Testament
    'mat': 'matthew', 'mar': 'mark', 'luk': 'luke', 'joh': 'john', 'act': 'acts',
    'rom': 'romans', '1co': '1 corinthians', '2co': '2 corinthians', 'gal': 'galatians',
    'eph': 'ephesians', 'phi': 'philippians', 'col': 'colossians', '1th': '1 thessalonians',
    '2th': '2 thessalonians', '1ti': '1 timothy', '2ti': '2 timothy', 'tit': 'titus',
    'phm': 'philemon', 'heb': 'hebrews', 'jam': 'james', '1pe': '1 peter', '2pe': '2 peter',
    '1jo': '1 john', '2jo': '2 john', '3jo': '3 john', 'jud': 'jude', 'rev': 'revelation'
  };

  const parseVerseReference = (query: string) => {
    // Clean the query
    const cleanQuery = query.trim().toLowerCase();
    console.log(`📖 Parsing verse reference: "${cleanQuery}"`);
    
    // Extract book name (everything before the first number)
    const bookMatch = cleanQuery.match(/^([a-z\s]+?)(\d+)/);
    if (!bookMatch) {
      console.log('❌ No book name found');
      return null;
    }
    
    let bookName = bookMatch[1].trim();
    const chapterVerse = bookMatch[2] + cleanQuery.substring(bookMatch[0].length);
    
    // Handle short forms
    if (bookNameMappings[bookName]) {
      bookName = bookNameMappings[bookName];
      console.log(`📖 Mapped "${bookMatch[1]}" to "${bookName}"`);
    }
    
    // Extract chapter and verse numbers - handle any symbol between them
    const chapterVerseMatch = chapterVerse.match(/(\d+)[-=';:.,/\\[\]*]+(\d+)/);
    if (!chapterVerseMatch) {
      console.log('❌ No chapter/verse found');
      return null;
    }
    
    const chapter = parseInt(chapterVerseMatch[1]);
    const verse = parseInt(chapterVerseMatch[2]);
    
    console.log(`📖 Parsed: Book="${bookName}", Chapter=${chapter}, Verse=${verse}`);
    
    return { bookName, chapter, verse };
  };


  const handleChapterSelect = async (chapter: number) => {
    if (!selectedBook) return;
    
    setSelectedChapter(chapter);
    setSelectedVerse(null); // Reset verse selection when changing chapters
    setVersePositions({}); // Reset verse positions for new chapter
    try {
      console.log(`📖 Loading chapter: ${selectedBook} ${chapter}`);
      const chapterData = await bibleService.getChapter(selectedTranslation, selectedBook, chapter);
      setCurrentChapter(chapterData);
    } catch (error) {
      console.error('❌ Error loading chapter:', error);
      Alert.alert('Error', 'Failed to load chapter. Please try again.');
    }
  };

  const handleVerseSelect = (verseNumber: number) => {
    console.log(`📖 Verse ${verseNumber} selected`);
    setSelectedVerse(verseNumber);
    
    // If we have the position measured, scroll immediately
    if (versePositions[verseNumber] !== undefined) {
      console.log(`📖 Using measured position: ${versePositions[verseNumber]}`);
      setTimeout(() => {
        mainScrollViewRef.current?.scrollTo({
          y: versePositions[verseNumber],
          animated: false
        });
      }, 100);
    } else {
      console.log(`📖 Position not yet measured, will scroll when measured`);
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
          <TouchableOpacity style={styles.backButton} onPress={() => selectedVerse ? setSelectedVerse(null) : setCurrentChapter(null)}>
            <ArrowLeft size={20} color="#c9a961" strokeWidth={2} />
            <Text style={styles.backButtonText}>
              {selectedVerse ? 'Back to Verse Selection' : 'Back to Chapters'}
            </Text>
          </TouchableOpacity>
          
          {/* Verse Selector Grid - Only show if no verse selected */}
          {!selectedVerse && (
            <View style={styles.verseSelector}>
              <Text style={styles.verseSelectorLabel}>
                Select Verse: Choose a verse
              </Text>
              <View style={styles.verseGrid}>
                {Array.from({ 
                  length: Math.min(currentChapter.verses.length, 50) // Limit to 50 verses for better UX
                }, (_, i) => i + 1).map((verseNum) => (
                  <TouchableOpacity
                    key={verseNum}
                    style={[
                      styles.verseGridCard,
                      selectedVerse === verseNum && styles.selectedVerseCard
                    ]}
                    onPress={() => handleVerseSelect(verseNum)}>
                    <Text style={[
                      styles.verseGridNumber,
                      selectedVerse === verseNum && styles.selectedVerseGridNumber
                    ]}>
                      {verseNum}
                    </Text>
                  </TouchableOpacity>
                ))}
                {currentChapter.verses.length > 50 && (
                  <View style={styles.moreVersesIndicator}>
                    <Text style={styles.moreVersesText}>
                      +{currentChapter.verses.length - 50} more verses
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {selectedVerse ? (
          <View style={styles.chapterContentContainer}>

            <View style={styles.versesContainer}>
              {currentChapter.verses.map((verse, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[
                    styles.verseContainer,
                    selectedVerse === verse.verseNumber && styles.selectedVerseContainer
                  ]}
                  onPress={() => handleVerseSelect(verse.verseNumber)}
                  onLayout={(event) => {
                    const { y, height } = event.nativeEvent.layout;
                    console.log(`📖 Verse ${verse.verseNumber} layout: y=${y}, height=${height}`);
                    
                    // Store the position for precise scrolling
                    setVersePositions(prev => ({
                      ...prev,
                      [verse.verseNumber]: y
                    }));
                  }}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.verseNumber,
                    selectedVerse === verse.verseNumber && styles.selectedVerseNumber
                  ]}>
                    {verse.verseNumber}
                  </Text>
                  <Text style={[
                    styles.verseText,
                    selectedVerse === verse.verseNumber && styles.selectedVerseText
                  ]}>
                    {verse.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
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
               {selectedBook && currentChapter && selectedVerse && (
                 <Text style={styles.headerSubtitle}>
                   {bibleBooks.find(b => b.id === selectedBook)?.name} {currentChapter.chapterNumber}
                 </Text>
               )}
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

          <ScrollView 
            ref={mainScrollViewRef}
            style={styles.content} 
            showsVerticalScrollIndicator={false}>

            {/* Search Interface */}
            {showSearch && (
              <View style={styles.searchSection}>
                <View style={styles.searchInputContainer}>
                  <Search size={20} color="#666666" strokeWidth={2} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search verses or enter reference (e.g., John 3:16, Lev 1.2, Ps 23-1)"
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
    justifyContent: 'flex-start',
    gap: 12,
  },
  chapterCard: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 8,
  },
  selectedChapterCard: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  chapterNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  selectedChapterNumber: {
    color: '#000000',
    fontSize: 20,
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
    marginBottom: 6,
    paddingBottom: 6,
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
    lineHeight: 22,
    flex: 1,
  },
  selectedVerseContainer: {
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c9a961',
    marginBottom: 16,
    paddingBottom: 16,
  },
  selectedVerseNumber: {
    color: '#c9a961',
    fontSize: 18,
  },
  selectedVerseText: {
    color: '#ffffff',
    fontFamily: 'Inter-Regular',
  },
  verseSelector: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  verseSelectorLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 12,
  },
  verseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  verseGridCard: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  selectedVerseCard: {
    backgroundColor: '#c9a961',
    borderColor: '#c9a961',
  },
  verseGridNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  selectedVerseGridNumber: {
    color: '#000000',
    fontSize: 20,
  },
  moreVersesIndicator: {
    width: 40,
    height: 40,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  moreVersesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 10,
  },
  selectedVerseDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centeredVerseContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#c9a961',
    alignItems: 'center',
    maxWidth: '100%',
  },
  centeredVerseNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#c9a961',
    marginBottom: 16,
    textAlign: 'center',
  },
  centeredVerseText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    color: '#ffffff',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSelectionButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  clearSelectionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#cccccc',
  },
  noVerseSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noVerseSelectedText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  versesScrollContent: {
    paddingBottom: 100, // Extra padding at bottom for better scrolling
  },
});