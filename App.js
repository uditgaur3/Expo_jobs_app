import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Pressable } from 'react-native';
import { useState } from 'react';
import JobListingScreen from './JobListingScreen';
import JobDetailScreen from './JobDetailScreen';
import BookmarksScreen from './BookmarksScreen';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [showBookmarks, setShowBookmarks] = useState(false);

  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
  };

  const handleBack = () => {
    setSelectedJobId(null);
  };

  const toggleBookmarks = () => {
    setShowBookmarks(!showBookmarks);
    setSelectedJobId(null); // Clear selected job when switching screens
  };

  return (
    <View style={styles.container}>
      {selectedJobId ? (
        <JobDetailScreen jobId={selectedJobId} onBack={handleBack} />
      ) : (
        <View style={styles.mainContainer}>
          {showBookmarks ? (
            <BookmarksScreen onJobSelect={handleJobSelect} />
          ) : (
            <JobListingScreen onJobSelect={handleJobSelect} />
          )}
          <Pressable 
            style={styles.toggleButton} 
            onPress={toggleBookmarks}
          >
            <Ionicons 
              name={showBookmarks ? "list" : "bookmark"} 
              size={24} 
              color="#fff" 
            />
          </Pressable>
        </View>
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  mainContainer: {
    flex: 1,
  },
  toggleButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#8a6ef0',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
