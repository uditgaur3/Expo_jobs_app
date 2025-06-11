import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const THEME = {
  primary: '#8B5CF6', // Purple color
  background: '#1a1a2e',
  border: 'rgba(190, 95, 95, 0.1)',
  text: '#fff',
  textSecondary: 'rgba(202, 71, 71, 0.6)',
};

export default function Layout() {
  const [refreshBookmarks, setRefreshBookmarks] = useState(0);
  const tabWidth = 100; // Width in percentage
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateSlider = (index) => {
    Animated.spring(slideAnim, {
      toValue: index,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: THEME.background,
            borderTopColor: THEME.border,
            height: 65,
            position: 'relative',
            paddingBottom: 10,
          },
          tabBarActiveTintColor: THEME.primary,
          tabBarInactiveTintColor: THEME.textSecondary,
          headerStyle: {
            backgroundColor: THEME.background,
          },
          headerTintColor: THEME.text,
          tabBarItemStyle: {
            paddingTop: 10,
          },
        }}
        screenListeners={{
          tabPress: (e) => {
            const targetIndex = e.target === 'bookmarks' ? 1 : 0;
            animateSlider(targetIndex);
          }
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Jobs',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "briefcase" : "briefcase-outline"} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmarks"
          options={{
            title: 'Bookmarks',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? "bookmark" : "bookmark-outline"} 
                size={size} 
                color={color} 
              />
            ),
          }}
          listeners={{
            tabPress: () => setRefreshBookmarks(prev => prev + 1),
          }}
        />
      </Tabs>
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, tabWidth]
              })
            }]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slider: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 65,
    backgroundColor: `${THEME.primary}15`,
    borderRadius: 12,
    zIndex: 0,
  }
}); 