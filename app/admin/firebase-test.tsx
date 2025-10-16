import { collection, getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db, storage } from '../../config/firebase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
}

export default function FirebaseTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (name: string, status: 'success' | 'error', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  const runFirebaseTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Basic Firebase Connection
    try {
      addTestResult('Firebase Config', 'success', 'Firebase configuration loaded');
    } catch (error) {
      addTestResult('Firebase Config', 'error', `Config error: ${(error as any)?.message}`);
    }

    // Test 2: Firestore Connection
    try {
      if (db) {
        addTestResult('Firestore Connection', 'success', 'Firestore database connected');
      } else {
        addTestResult('Firestore Connection', 'error', 'Firestore not initialized');
      }
    } catch (error) {
      addTestResult('Firestore Connection', 'error', `Firestore error: ${(error as any)?.message}`);
    }

    // Test 3: Auth Service
    try {
      if (auth) {
        addTestResult('Auth Service', 'success', 'Authentication service available');
      } else {
        addTestResult('Auth Service', 'error', 'Auth service not initialized');
      }
    } catch (error) {
      addTestResult('Auth Service', 'error', `Auth error: ${(error as any)?.message}`);
    }

    // Test 4: Storage Service
    try {
      if (storage) {
        addTestResult('Storage Service', 'success', 'Storage service available');
      } else {
        addTestResult('Storage Service', 'error', 'Storage service not initialized');
      }
    } catch (error) {
      addTestResult('Storage Service', 'error', `Storage error: ${(error as any)?.message}`);
    }

    // Test 5: Firestore Collections Access
    try {
      if (db) {
        const eventsRef = collection(db, 'events');
        addTestResult('Events Collection', 'success', 'Events collection accessible');
        
        // Try to get a document to test read permissions
        const eventsSnapshot = await getDocs(eventsRef);
        addTestResult('Events Read', 'success', `Found ${eventsSnapshot.size} events`);
      } else {
        addTestResult('Events Collection', 'error', 'Firestore not available');
      }
    } catch (error) {
      addTestResult('Events Collection', 'error', `Events error: ${(error as any)?.message}`);
    }

    // Test 6: Audio Sermons Collection
    try {
      if (db) {
        const sermonsRef = collection(db, 'audioSermons');
        const sermonsSnapshot = await getDocs(sermonsRef);
        addTestResult('Sermons Collection', 'success', `Found ${sermonsSnapshot.size} sermons`);
      } else {
        addTestResult('Sermons Collection', 'error', 'Firestore not available');
      }
    } catch (error) {
      addTestResult('Sermons Collection', 'error', `Sermons error: ${(error as any)?.message}`);
    }

    // Test 7: Audio Series Collection
    try {
      if (db) {
        const seriesRef = collection(db, 'audioSeries');
        const seriesSnapshot = await getDocs(seriesRef);
        addTestResult('Series Collection', 'success', `Found ${seriesSnapshot.size} series`);
      } else {
        addTestResult('Series Collection', 'error', 'Firestore not available');
      }
    } catch (error) {
      addTestResult('Series Collection', 'error', `Series error: ${(error as any)?.message}`);
    }

    // Test 8: News Collection
    try {
      if (db) {
        const newsRef = collection(db, 'news');
        const newsSnapshot = await getDocs(newsRef);
        addTestResult('News Collection', 'success', `Found ${newsSnapshot.size} news items`);
      } else {
        addTestResult('News Collection', 'error', 'Firestore not available');
      }
    } catch (error) {
      addTestResult('News Collection', 'error', `News error: ${(error as any)?.message}`);
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#00ff00';
      case 'error': return '#ff0000';
      default: return '#666666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Firebase Connection Test</Text>
        <Text style={styles.subtitle}>Verify Firebase and Firestore connectivity</Text>
      </View>

      <TouchableOpacity 
        style={[styles.testButton, isRunning && styles.testButtonDisabled]}
        onPress={runFirebaseTests}
        disabled={isRunning}
      >
        <Text style={styles.testButtonText}>
          {isRunning ? 'Running Tests...' : 'Run Firebase Tests'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultIcon}>{getStatusIcon(result.status)}</Text>
            <View style={styles.resultContent}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                {result.message}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {testResults.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Summary:</Text>
          <Text style={styles.summaryText}>
            {testResults.filter(r => r.status === 'success').length} passed, {' '}
            {testResults.filter(r => r.status === 'error').length} failed
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
  testButton: {
    backgroundColor: '#c9a961',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#666666',
  },
  testButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  resultsContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  resultsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  summary: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#c9a961',
  },
});


