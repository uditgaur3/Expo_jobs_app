import { ActivityIndicator, FlatList, StyleSheet, Text, View, Platform, StatusBar, Pressable, Animated } from 'react-native';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME = {
    primary: '#8B5CF6',
    gradient: ['#1a1a2e', '#16213e', '#0f3460'],
    background: '#1a1a2e',
    text: '#fff',
    textSecondary: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.1)',
};

const SPRING_CONFIG = {
    useNativeDriver: true,
    tension: 40,
    friction: 7,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
};

const BookmarksScreen = ({ onJobSelect, refreshTrigger }) => {
    const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const animatedValues = useRef({});
    const isFirstLoad = useRef(true);

    const getAnimatedValue = useCallback((id) => {
        if (!animatedValues.current[id]) {
            animatedValues.current[id] = new Animated.Value(1.0);
        }
        return animatedValues.current[id];
    }, []);

    const handlePressIn = useCallback((id) => {
        Animated.spring(getAnimatedValue(id), {
            toValue: 0.98,
            ...SPRING_CONFIG
        }).start();
    }, [getAnimatedValue]);

    const handlePressOut = useCallback((id) => {
        Animated.spring(getAnimatedValue(id), {
            toValue: 1,
            ...SPRING_CONFIG
        }).start();
    }, [getAnimatedValue]);

    const loadBookmarkedJobs = useCallback(async () => {
        try {
            setIsLoading(true);
            const bookmarkedIds = await AsyncStorage.getItem('bookmarkedJobs');
            const ids = JSON.parse(bookmarkedIds || '[]');
            
            if (!ids.length) {
                setBookmarkedJobs([]);
                return;
            }

            const response = await fetch('https://testapi.getlokalapp.com/common/jobs?page=1');
            const data = await response.json();
            setBookmarkedJobs(data.results.filter(job => ids.includes(job.id)));
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isFirstLoad.current || refreshTrigger) {
            loadBookmarkedJobs();
            isFirstLoad.current = false;
        }
    }, [refreshTrigger, loadBookmarkedJobs]);

    const removeBookmark = useCallback(async (jobId) => {
        try {
            const bookmarkedIds = await AsyncStorage.getItem('bookmarkedJobs');
            const ids = JSON.parse(bookmarkedIds || '[]');
            await AsyncStorage.setItem('bookmarkedJobs', JSON.stringify(ids.filter(id => id !== jobId)));
            setBookmarkedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error removing bookmark:', error);
        }
    }, []);

    const renderJobCard = useCallback(({ item }) => {
        const scale = getAnimatedValue(item.id);
        const primaryDetails = item.primary_details || {};
        
        return (
            <Pressable 
                onPressIn={() => handlePressIn(item.id)}
                onPressOut={() => handlePressOut(item.id)}
                onPress={() => onJobSelect?.(item.id)}
            >
                <Animated.View style={[styles.cardWrapper, { transform: [{ scale }] }]}>
                    <LinearGradient
                        colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardBorder}
                    >
                        <BlurView intensity={20} tint="dark" style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.companyName}>{item.company_name}</Text>
                                    <Text style={styles.jobTitle}>{item.title}</Text>
                                </View>
                                <Pressable 
                                    onPress={() => removeBookmark(item.id)}
                                    style={styles.bookmarkButton}
                                >
                                    <Ionicons name="bookmark" size={24} color={THEME.primary} />
                                </Pressable>
                            </View>
                            
                            <View style={styles.detailsContainer}>
                                {renderDetailRow('location-outline', primaryDetails.Place)}
                                {renderDetailRow('business-outline', primaryDetails.Job_Type)}
                                {renderDetailRow('cash-outline', primaryDetails.Salary)}
                                <View style={styles.footerRow}>
                                    {renderDetailRow('school-outline', primaryDetails.Qualification)}
                                    <View style={[styles.badge, item.is_premium ? styles.paidBadge : styles.unpaidBadge]}>
                                        <Text style={styles.badgeText}>{item.is_premium ? 'PREMIUM' : 'REGULAR'}</Text>
                                    </View>
                                </View>
                            </View>
                        </BlurView>
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        );
    }, [getAnimatedValue, handlePressIn, handlePressOut, onJobSelect, removeBookmark]);

    const renderDetailRow = useCallback((icon, value) => (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={16} color={THEME.textSecondary} />
            <Text style={styles.details}>{value || 'Not specified'}</Text>
        </View>
    ), []);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={THEME.gradient} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color={THEME.text} style={styles.loader} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <LinearGradient colors={THEME.gradient} style={StyleSheet.absoluteFill} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Bookmarked Jobs</Text>
                <Text style={styles.headerSubtitle}>Your saved job opportunities</Text>
            </View>

            {bookmarkedJobs.length > 0 ? (
                <FlatList 
                    data={bookmarkedJobs}
                    renderItem={renderJobCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="bookmark-outline" size={64} color={THEME.textSecondary} />
                    <Text style={styles.emptyText}>No bookmarked jobs yet</Text>
                    <Text style={styles.emptySubtext}>Jobs you bookmark will appear here</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    header: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 16 : 16,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: THEME.text,
        marginBottom: 4,
        paddingHorizontal: 36,
    },
    headerSubtitle: {
        fontSize: 16,
        color: THEME.textSecondary,
        paddingHorizontal: 36,
    },
    list: {
        paddingVertical: 8,
    },
    cardWrapper: {
        marginHorizontal: 10,
        marginBottom: 16,
    },
    cardBorder: {
        borderRadius: 16,
        padding: 1,
        marginHorizontal: 10,
    },
    card: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderRadius: 15,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    titleContainer: {
        flex: 1,
        marginRight: 12,
    },
    companyName: {
        fontSize: 20,
        fontWeight: '600',
        color: THEME.text,
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 16,
        color: THEME.textSecondary,
        marginBottom: 12,
    },
    detailsContainer: {
        marginTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    details: {
        fontSize: 14,
        color: THEME.textSecondary,
        marginLeft: 8,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    paidBadge: {
        backgroundColor: `${THEME.primary}33`,
    },
    unpaidBadge: {
        backgroundColor: 'rgba(247, 37, 133, 0.2)',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: THEME.text,
    },
    bookmarkButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        color: THEME.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubtext: {
        color: THEME.textSecondary,
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
    },
    loader: {
        flex: 1,
    },
});

export default BookmarksScreen; 