import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Colors, Spacing, Typography } from '../constants/color';
import AuthService from '../api/authService';
import UserService from '../api/userService';

// Import reusable components
import EmptyState from '../components/EmptyState';
import ReusableFlatList from '../components/ReusableFlatList';
import RankingCard from '../components/RankingCard';
import Header from '../components/Header';
import { SectionHeader } from '../components/SectionHeader';

const CommunityScreen = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  
  const fetchRankings = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    
    try {
      // Get current user
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      
      // Simulate backend delay of 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fetch rankings from server
      const mockRankings = await getMockRankings();
      setRankings(mockRankings);
      
      // Find current user's rank
      if (user) {
        const userRank = mockRankings.findIndex(item => 
          item.user.id === user.id || item.user._id === user._id
        );
        
        if (userRank >= 0) {
          setCurrentUserRank(userRank + 1); // +1 because array is 0-indexed
        }
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Mock function to generate rankings - replace with actual API call later
  const getMockRankings = async () => {
    // Try to get real users if available
    let users = [];
    try {
      // This would be replaced with an actual API call in production
      users = await UserService.getUsers();
    } catch (error) {
      // If API isn't ready, use mock data
      users = [
        { id: '1', name: 'Emma Johnson', email: 'emma@example.com' },
        { id: '2', name: 'Noah Smith', email: 'noah@example.com' },
        { id: '3', name: 'Olivia Williams', email: 'olivia@example.com' },
        { id: '4', name: 'Liam Brown', email: 'liam@example.com' },
        { id: '5', name: 'Ava Jones', email: 'ava@example.com' },
        { id: '6', name: 'Ethan Miller', email: 'ethan@example.com' },
        { id: '7', name: 'Sophia Davis', email: 'sophia@example.com' },
        { id: '8', name: 'Mason Wilson', email: 'mason@example.com' },
        { id: '9', name: 'Isabella Taylor', email: 'isabella@example.com' },
        { id: '10', name: 'Logan Martinez', email: 'logan@example.com' },
      ];
    }
    
    // Add current user to the list if not already included
    const currentUser = await AuthService.getCurrentUser();
    if (currentUser && !users.some(u => u.id === currentUser.id || u._id === currentUser._id)) {
      users.push(currentUser);
    }
    
    // Generate random scores for mock data
    return users.map(user => ({
      user,
      score: Math.floor(Math.random() * 1000)
    })).sort((a, b) => b.score - a.score); // Sort by score (descending)
  };
  
  useEffect(() => {
    fetchRankings();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings(true);
  };
  
  const renderHeader = () => (
    <View>
      <Header title="Pharmacy Student Rankings" />
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Based on pronunciation scores and practice time
        </Text>
      </View>
    </View>
  );
  
  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        Practice more drugs to improve your ranking!
      </Text>
    </View>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          Loading rankings...
        </Text>
      </View>
    );
  }
  
  if (rankings.length === 0) {
    return <EmptyState 
      icon="people"
      message="No ranking data available yet. Be the first to practice and get ranked!"
    />;
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ReusableFlatList
        data={rankings}
        renderItem={({ item, index }) => (
          <RankingCard
            rank={index + 1}
            user={item.user}
            score={item.score}
            isCurrentUser={
              currentUser && 
              (item.user.id === currentUser.id || item.user._id === currentUser._id)
            }
          />
        )}
        keyExtractor={(item, index) => `rank-${index}-${item.user.id || item.user._id || index}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      />
      
      {currentUserRank && (
        <View style={styles.yourRankContainer}>
          <Text style={styles.yourRankText}>
            Your Rank: {currentUserRank} of {rankings.length}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Minimal styling, most styling is in components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.medium,
    color: Colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  subtitleContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  },
  yourRankContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    alignItems: 'center',
  },
  yourRankText: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
});

export default CommunityScreen; 
