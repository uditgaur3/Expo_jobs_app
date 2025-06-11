import BookmarksScreen from '../components/BookmarksScreen';
import { useLocalSearchParams } from 'expo-router';

export default function BookmarksTab() {
  const { refreshTrigger } = useLocalSearchParams();
  return <BookmarksScreen refreshTrigger={refreshTrigger} />;
} 