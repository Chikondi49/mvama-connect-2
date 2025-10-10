// Bible Service for bible-api.com
// Documentation: https://bible-api.com/

export interface BibleTranslation {
  id: string;
  name: string;
  language: string;
  abbreviation: string;
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface BibleChapter {
  id: string;
  bookId: string;
  chapterNumber: number;
  verses: BibleVerse[];
}

export interface BibleVerse {
  id: string;
  chapterId: string;
  verseNumber: number;
  text: string;
  footnotes?: string[];
}

export interface BibleSearchResult {
  id: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
  translation: string;
}

class BibleService {
  private BASE_URL = 'https://bible-api.com';

  // Get available translations
  async getAvailableTranslations(): Promise<BibleTranslation[]> {
    try {
      console.log('📖 Fetching available translations...');
      // bible-api.com doesn't have a translations endpoint, so we return the supported ones
      const translations: BibleTranslation[] = [
        { id: 'web', name: 'World English Bible', language: 'English', abbreviation: 'WEB' },
        { id: 'kjv', name: 'King James Version', language: 'English', abbreviation: 'KJV' },
        { id: 'asv', name: 'American Standard Version', language: 'English', abbreviation: 'ASV' },
        { id: 'bbe', name: 'Bible in Basic English', language: 'English', abbreviation: 'BBE' },
        { id: 'darby', name: 'Darby Bible', language: 'English', abbreviation: 'DARBY' },
        { id: 'dra', name: 'Douay-Rheims 1899 American Edition', language: 'English', abbreviation: 'DRA' },
        { id: 'ylt', name: 'Young\'s Literal Translation', language: 'English', abbreviation: 'YLT' },
        { id: 'oeb-cw', name: 'Open English Bible, Commonwealth Edition', language: 'English (UK)', abbreviation: 'OEB-CW' },
        { id: 'webbe', name: 'World English Bible, British Edition', language: 'English (UK)', abbreviation: 'WEBBE' },
        { id: 'oeb-us', name: 'Open English Bible, US Edition', language: 'English (US)', abbreviation: 'OEB-US' },
        { id: 'cuv', name: 'Chinese Union Version', language: 'Chinese', abbreviation: 'CUV' },
        { id: 'bkr', name: 'Bible kralická', language: 'Czech', abbreviation: 'BKR' },
        { id: 'cherokee', name: 'Cherokee New Testament', language: 'Cherokee', abbreviation: 'CHEROKEE' },
        { id: 'clementine', name: 'Clementine Latin Vulgate', language: 'Latin', abbreviation: 'CLEMENTINE' },
        { id: 'almeida', name: 'João Ferreira de Almeida', language: 'Portuguese', abbreviation: 'ALMEIDA' },
        { id: 'rccv', name: 'Protestant Romanian Corrected Cornilescu Version', language: 'Romanian', abbreviation: 'RCCV' }
      ];
      
      console.log('✅ Translations loaded:', translations.length);
      return translations;
    } catch (error) {
      console.error('❌ Error fetching translations:', error);
      // Return fallback translations
      return [
        { id: 'web', name: 'World English Bible', language: 'English', abbreviation: 'WEB' },
        { id: 'kjv', name: 'King James Version', language: 'English', abbreviation: 'KJV' },
        { id: 'asv', name: 'American Standard Version', language: 'English', abbreviation: 'ASV' }
      ];
    }
  }

  // Get books for a specific translation
  async getBooks(translationId: string): Promise<BibleBook[]> {
    try {
      console.log(`📚 Fetching books for translation: ${translationId}`);
      // bible-api.com doesn't have a books endpoint, so we return our predefined books
      const books = this.getFallbackBooks();
      console.log('✅ Books loaded:', books.length);
      return books;
    } catch (error) {
      console.error('❌ Error fetching books:', error);
      return this.getFallbackBooks();
    }
  }

  // Get a specific chapter using bible-api.com format
  async getChapter(translationId: string, bookId: string, chapterNumber: number): Promise<BibleChapter> {
    try {
      console.log(`📖 Fetching chapter: ${bookId} ${chapterNumber} (${translationId})`);
      
      // Convert book ID to bible-api.com format
      const bookName = this.convertBookIdToName(bookId);
      const url = `${this.BASE_URL}/${bookName}+${chapterNumber}?translation=${translationId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Chapter loaded:', data.verses?.length || 0, 'verses');
      
      // Convert bible-api.com format to our format
      const verses: BibleVerse[] = (data.verses || []).map((verse: any) => ({
        id: `${bookId}-${chapterNumber}-${verse.verse}`,
        chapterId: `${bookId}-${chapterNumber}`,
        verseNumber: verse.verse,
        text: verse.text
      }));

      return {
        id: `${bookId}-${chapterNumber}`,
        bookId,
        chapterNumber,
        verses
      };
    } catch (error) {
      console.error('❌ Error fetching chapter:', error);
      throw error;
    }
  }

  // Search for verses using bible-api.com
  async searchVerses(query: string, translationId: string, limit: number = 20): Promise<BibleSearchResult[]> {
    try {
      console.log(`🔍 Searching verses: "${query}" in ${translationId}`);
      
      // For bible-api.com, we'll need to implement search differently
      // Since it doesn't have a search endpoint, we'll return empty results
      // In a real implementation, you might use a different search service
      console.log('⚠️ Search not directly supported by bible-api.com');
      return [];
    } catch (error) {
      console.error('❌ Error searching verses:', error);
      return [];
    }
  }

  // Get verse of the day using bible-api.com
  async getVerseOfTheDay(): Promise<BibleSearchResult> {
    try {
      console.log('🌟 Fetching verse of the day...');
      // Use a specific verse instead of random endpoint
      const response = await fetch(`${this.BASE_URL}/john+3:16?translation=web`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Verse of the day loaded:', data);
      
      // Handle the actual bible-api.com response structure
      const verse = data.verses && data.verses[0] ? data.verses[0] : null;
      
      if (verse) {
        return {
          id: `${verse.book_id}-${verse.chapter}-${verse.verse}`,
          bookId: verse.book_id || 'JHN',
          bookName: verse.book_name || 'John',
          chapterNumber: verse.chapter || 3,
          verseNumber: verse.verse || 16,
          text: verse.text || 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
          translation: 'WEB'
        };
      } else {
        // Fallback if no verse data
        return {
          id: 'john-3-16',
          bookId: 'JHN',
          bookName: 'John',
          chapterNumber: 3,
          verseNumber: 16,
          text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
          translation: 'WEB'
        };
      }
    } catch (error) {
      console.error('❌ Error fetching verse of the day:', error);
      // Return fallback verse
      return {
        id: 'john-3-16',
        bookId: 'JHN',
        bookName: 'John',
        chapterNumber: 3,
        verseNumber: 16,
        text: 'For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life.',
        translation: 'WEB'
      };
    }
  }

  // Convert our book ID to bible-api.com format
  private convertBookIdToName(bookId: string): string {
    const bookMap: { [key: string]: string } = {
      'GEN': 'genesis',
      'EXO': 'exodus',
      'LEV': 'leviticus',
      'NUM': 'numbers',
      'DEU': 'deuteronomy',
      'JOS': 'joshua',
      'JDG': 'judges',
      'RUT': 'ruth',
      '1SA': '1 samuel',
      '2SA': '2 samuel',
      '1KI': '1 kings',
      '2KI': '2 kings',
      '1CH': '1 chronicles',
      '2CH': '2 chronicles',
      'EZR': 'ezra',
      'NEH': 'nehemiah',
      'EST': 'esther',
      'JOB': 'job',
      'PSA': 'psalms',
      'PRO': 'proverbs',
      'ECC': 'ecclesiastes',
      'SNG': 'song of solomon',
      'ISA': 'isaiah',
      'JER': 'jeremiah',
      'LAM': 'lamentations',
      'EZK': 'ezekiel',
      'DAN': 'daniel',
      'HOS': 'hosea',
      'JOL': 'joel',
      'AMO': 'amos',
      'OBA': 'obadiah',
      'JON': 'jonah',
      'MIC': 'micah',
      'NAH': 'nahum',
      'HAB': 'habakkuk',
      'ZEP': 'zephaniah',
      'HAG': 'haggai',
      'ZEC': 'zechariah',
      'MAL': 'malachi',
      'MAT': 'matthew',
      'MRK': 'mark',
      'LUK': 'luke',
      'JHN': 'john',
      'ACT': 'acts',
      'ROM': 'romans',
      '1CO': '1 corinthians',
      '2CO': '2 corinthians',
      'GAL': 'galatians',
      'EPH': 'ephesians',
      'PHI': 'philippians',
      'COL': 'colossians',
      '1TH': '1 thessalonians',
      '2TH': '2 thessalonians',
      '1TI': '1 timothy',
      '2TI': '2 timothy',
      'TIT': 'titus',
      'PHM': 'philemon',
      'HEB': 'hebrews',
      'JAS': 'james',
      '1PE': '1 peter',
      '2PE': '2 peter',
      '1JN': '1 john',
      '2JN': '2 john',
      '3JN': '3 john',
      'JUD': 'jude',
      'REV': 'revelation'
    };
    
    return bookMap[bookId] || bookId.toLowerCase();
  }

  // Fallback books data
  private getFallbackBooks(): BibleBook[] {
    return [
      // Old Testament
      { id: 'GEN', name: 'Genesis', testament: 'old', chapters: 50 },
      { id: 'EXO', name: 'Exodus', testament: 'old', chapters: 40 },
      { id: 'LEV', name: 'Leviticus', testament: 'old', chapters: 27 },
      { id: 'NUM', name: 'Numbers', testament: 'old', chapters: 36 },
      { id: 'DEU', name: 'Deuteronomy', testament: 'old', chapters: 34 },
      { id: 'JOS', name: 'Joshua', testament: 'old', chapters: 24 },
      { id: 'JDG', name: 'Judges', testament: 'old', chapters: 21 },
      { id: 'RUT', name: 'Ruth', testament: 'old', chapters: 4 },
      { id: '1SA', name: '1 Samuel', testament: 'old', chapters: 31 },
      { id: '2SA', name: '2 Samuel', testament: 'old', chapters: 24 },
      { id: '1KI', name: '1 Kings', testament: 'old', chapters: 22 },
      { id: '2KI', name: '2 Kings', testament: 'old', chapters: 25 },
      { id: '1CH', name: '1 Chronicles', testament: 'old', chapters: 29 },
      { id: '2CH', name: '2 Chronicles', testament: 'old', chapters: 36 },
      { id: 'EZR', name: 'Ezra', testament: 'old', chapters: 10 },
      { id: 'NEH', name: 'Nehemiah', testament: 'old', chapters: 13 },
      { id: 'EST', name: 'Esther', testament: 'old', chapters: 10 },
      { id: 'JOB', name: 'Job', testament: 'old', chapters: 42 },
      { id: 'PSA', name: 'Psalms', testament: 'old', chapters: 150 },
      { id: 'PRO', name: 'Proverbs', testament: 'old', chapters: 31 },
      { id: 'ECC', name: 'Ecclesiastes', testament: 'old', chapters: 12 },
      { id: 'SNG', name: 'Song of Songs', testament: 'old', chapters: 8 },
      { id: 'ISA', name: 'Isaiah', testament: 'old', chapters: 66 },
      { id: 'JER', name: 'Jeremiah', testament: 'old', chapters: 52 },
      { id: 'LAM', name: 'Lamentations', testament: 'old', chapters: 5 },
      { id: 'EZK', name: 'Ezekiel', testament: 'old', chapters: 48 },
      { id: 'DAN', name: 'Daniel', testament: 'old', chapters: 12 },
      { id: 'HOS', name: 'Hosea', testament: 'old', chapters: 14 },
      { id: 'JOL', name: 'Joel', testament: 'old', chapters: 3 },
      { id: 'AMO', name: 'Amos', testament: 'old', chapters: 9 },
      { id: 'OBA', name: 'Obadiah', testament: 'old', chapters: 1 },
      { id: 'JON', name: 'Jonah', testament: 'old', chapters: 4 },
      { id: 'MIC', name: 'Micah', testament: 'old', chapters: 7 },
      { id: 'NAH', name: 'Nahum', testament: 'old', chapters: 3 },
      { id: 'HAB', name: 'Habakkuk', testament: 'old', chapters: 3 },
      { id: 'ZEP', name: 'Zephaniah', testament: 'old', chapters: 3 },
      { id: 'HAG', name: 'Haggai', testament: 'old', chapters: 2 },
      { id: 'ZEC', name: 'Zechariah', testament: 'old', chapters: 14 },
      { id: 'MAL', name: 'Malachi', testament: 'old', chapters: 4 },
      
      // New Testament
      { id: 'MAT', name: 'Matthew', testament: 'new', chapters: 28 },
      { id: 'MRK', name: 'Mark', testament: 'new', chapters: 16 },
      { id: 'LUK', name: 'Luke', testament: 'new', chapters: 24 },
      { id: 'JHN', name: 'John', testament: 'new', chapters: 21 },
      { id: 'ACT', name: 'Acts', testament: 'new', chapters: 28 },
      { id: 'ROM', name: 'Romans', testament: 'new', chapters: 16 },
      { id: '1CO', name: '1 Corinthians', testament: 'new', chapters: 16 },
      { id: '2CO', name: '2 Corinthians', testament: 'new', chapters: 13 },
      { id: 'GAL', name: 'Galatians', testament: 'new', chapters: 6 },
      { id: 'EPH', name: 'Ephesians', testament: 'new', chapters: 6 },
      { id: 'PHI', name: 'Philippians', testament: 'new', chapters: 4 },
      { id: 'COL', name: 'Colossians', testament: 'new', chapters: 4 },
      { id: '1TH', name: '1 Thessalonians', testament: 'new', chapters: 5 },
      { id: '2TH', name: '2 Thessalonians', testament: 'new', chapters: 3 },
      { id: '1TI', name: '1 Timothy', testament: 'new', chapters: 6 },
      { id: '2TI', name: '2 Timothy', testament: 'new', chapters: 4 },
      { id: 'TIT', name: 'Titus', testament: 'new', chapters: 3 },
      { id: 'PHM', name: 'Philemon', testament: 'new', chapters: 1 },
      { id: 'HEB', name: 'Hebrews', testament: 'new', chapters: 13 },
      { id: 'JAS', name: 'James', testament: 'new', chapters: 5 },
      { id: '1PE', name: '1 Peter', testament: 'new', chapters: 5 },
      { id: '2PE', name: '2 Peter', testament: 'new', chapters: 3 },
      { id: '1JN', name: '1 John', testament: 'new', chapters: 5 },
      { id: '2JN', name: '2 John', testament: 'new', chapters: 1 },
      { id: '3JN', name: '3 John', testament: 'new', chapters: 1 },
      { id: 'JUD', name: 'Jude', testament: 'new', chapters: 1 },
      { id: 'REV', name: 'Revelation', testament: 'new', chapters: 22 }
    ];
  }
}

export const bibleService = new BibleService();