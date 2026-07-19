import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://election-backend-74w1.onrender.com/api';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [booth, setBooth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOfflineData, setIsOfflineData] = useState(false);

  // Check for cached data when the app opens
  useEffect(() => {
    const loadCachedBooth = async () => {
      try {
        const cachedData = await AsyncStorage.getItem('@cached_booth');
        if (cachedData) {
          setBooth(JSON.parse(cachedData));
          setIsOfflineData(true);
        }
      } catch (e) {
        console.error("Failed to load cached data", e);
      }
    };
    loadCachedBooth();
  }, []);

  const searchBooth = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/booths/search`, {
        params: { query: searchQuery.trim() }
      });

      if (response.data && response.data.length > 0) {
        const fetchedBooth = response.data[0];
        setBooth(fetchedBooth);
        setIsOfflineData(false);

        // Save the successful result to local storage
        await AsyncStorage.setItem('@cached_booth', JSON.stringify(fetchedBooth));
      } else {
        setError('No booth found with that name or number.');
        setBooth(null);
      }
    } catch (err) {
      console.error(err);
      setError('Network request failed. Falling back to offline cached data if available.');
    } finally {
      setLoading(false);
    }
  };

  const renderBoothDetails = () => {
    if (!booth) return null;

    const totalVotesCast = booth.votes.reduce((acc, v) => acc + v.votes, 0);
    const turnout = booth.total_voters > 0 ? ((totalVotesCast / booth.total_voters) * 100).toFixed(1) : 0;

    return (
      <View style={styles.card}>

        {/* Offline Warning Badge */}
        {isOfflineData && (
          <View style={{ backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, marginBottom: 12 }}>
            <Text style={{ color: '#D97706', fontWeight: 'bold', textAlign: 'center' }}>
              ⚠️ Viewing Offline Cached Data
            </Text>
          </View>
        )}

        <Text style={styles.title}>{booth.name}</Text>
        <Text style={styles.subtitle}>Booth Number: {booth.number}</Text>
        <Text style={styles.subtitle}>Location: {booth.location_name}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Total Voters</Text>
            <Text style={styles.statValue}>{booth.total_voters}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Turnout</Text>
            <Text style={styles.statValue}>{turnout}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Vote Distribution</Text>
        {booth.votes.map((v, index) => (
          <View key={index} style={styles.voteRow}>
            <View>
              <Text style={styles.candidateName}>{v.candidate.name}</Text>
              <Text style={styles.candidateParty}>{v.candidate.party}</Text>
            </View>
            <Text style={styles.voteCount}>{v.votes} votes</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Election Field App</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter booth name or number..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchBooth}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchBooth} activeOpacity={0.8}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {renderBoothDetails()}

      <StatusBar style="auto" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F1F5F9',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginRight: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 16,
    color: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchButton: {
    backgroundColor: '#4F46E5',
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F8FAFC',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4F46E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
    marginBottom: 15,
    color: '#1E293B',
  },
  voteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  candidateParty: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  }
});
