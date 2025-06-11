import { ActivityIndicator, FlatList, StyleSheet, Text, View, Platform, StatusBar, Pressable, Animated } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { useFonts, SquadaOne_400Regular } from '@expo-google-fonts/squada-one'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
};

const JobListingScreen = ({ onJobSelect }) => {
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookmarks, setBookmarks] = useState(new Set());
    const animatedValues = useRef({});

    const [fontsLoaded] = useFonts({
        'SquadaOne': SquadaOne_400Regular,
    });

    const loadBookmarks = useCallback(async () => {
        try {
            const savedBookmarks = await AsyncStorage.getItem('bookmarkedJobs');
            if (savedBookmarks) {
                setBookmarks(new Set(JSON.parse(savedBookmarks)));
            }
        } catch (error) {
            console.error('Error loading bookmarks:', error);
        }
    }, []);

    const saveBookmarks = useCallback(async (newBookmarks) => {
        try {
            await AsyncStorage.setItem('bookmarkedJobs', JSON.stringify([...newBookmarks]));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    }, []);

    const toggleBookmark = useCallback(async (id) => {
        const newBookmarks = new Set(bookmarks);
        if (newBookmarks.has(id)) {
            newBookmarks.delete(id);
        } else {
            newBookmarks.add(id);
        }
        setBookmarks(newBookmarks);
        await saveBookmarks(newBookmarks);
    }, [bookmarks, saveBookmarks]);

    const getAnimatedValue = useCallback((id) => {
        if (!animatedValues.current[id]) {
            animatedValues.current[id] = new Animated.Value(1);
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

    const getJobs = useCallback(async () => {
        try {
            const response = await fetch("https://testapi.getlokalapp.com/common/jobs?page=1");
            const data = await response.json();
            setJobs(data.results.filter(job => job.type === 1009));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getJobs();
        loadBookmarks();
    }, [getJobs, loadBookmarks]);

    const renderDetailRow = useCallback(({ icon, value }) => (
        <View style={styles.detailRow}>
            <Ionicons name={icon} size={16} color={THEME.textSecondary} />
            <Text style={styles.details}>{value || 'Not specified'}</Text>
        </View>
    ), []);

    const renderJobCard = useCallback(({ item }) => {
        const scale = getAnimatedValue(item.id);
        const primaryDetails = item.primary_details || {};
        const isBookmarked = bookmarks.has(item.id);
        
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
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(item.id);
                                    }}
                                    style={styles.bookmarkButton}
                                >
                                    <Ionicons 
                                        name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                                        size={24} 
                                        color={isBookmarked ? THEME.primary : THEME.textSecondary}
                                    />
                                </Pressable>
                            </View>
                            
                            <View style={styles.detailsContainer}>
                                {renderDetailRow({ icon: 'location-outline', value: primaryDetails.Place })}
                                {renderDetailRow({ icon: 'business-outline', value: primaryDetails.Job_Type })}
                                {renderDetailRow({ icon: 'cash-outline', value: primaryDetails.Salary })}

                                <View style={styles.footerRow}>
                                    {renderDetailRow({ icon: 'school-outline', value: primaryDetails.Qualification })}
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
    }, [getAnimatedValue, handlePressIn, handlePressOut, onJobSelect, toggleBookmark, bookmarks, renderDetailRow]);

    if (!fontsLoaded) return null;

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
                <Text style={styles.headerTitle}>Find Your Dream Job</Text>
                <Text style={styles.headerSubtitle}>Discover opportunities that match your skills</Text>
            </View>
            <FlatList 
                data={jobs}
                renderItem={renderJobCard}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
            />
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
        fontFamily: 'SquadaOne',
        color: THEME.text,
        marginBottom: 4,
        paddingHorizontal: 36,
    },
    headerSubtitle: {
        fontSize: 16,
        fontFamily: 'SquadaOne',
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
    loader: {
        flex: 1,
    },
});

export default JobListingScreen;