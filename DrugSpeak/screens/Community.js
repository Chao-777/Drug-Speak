import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { Colors, Spacing, Typography } from '../constants/color';
import AuthService from '../api/authService';
import RecordService from '../api/recordService';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import reusable components
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';

const CommunityScreen = ({ navigation }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchRankings = async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    
    try {
      // Get current user first
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
      const currentUserId = user?.id || user?._id;
      
      // Get all study records
      let studyRecords = [];
      try {
        studyRecords = await RecordService.getAllStudyRecords();
      } catch (error) {
        console.error('Error fetching study records:', error);
        studyRecords = [];
      }
      
      // Process study records
      const userRankings = [];
      const processedUserIds = new Set();
      
      // Process each study record
      for (const record of studyRecords) {
        // Skip invalid records
        if (!record || !record.userId) continue;
        
        // Skip already processed users
        if (processedUserIds.has(record.userId)) continue;
        processedUserIds.add(record.userId);
        
        // Check if the record has a nested user object
        const userProfile = record.user || {};
        
        // Try multiple potential field names for username and gender
        const username = record.username || record.name || 
                         userProfile.username || userProfile.name || 
                         `User ${record.userId.substring(0, 5)}`;
                         
        const gender = record.gender || userProfile.gender || 'Not specified';
        
        // Add to rankings
        userRankings.push({
          userId: record.userId,
          username: username,
          gender: gender,
          score: record.totalScore || 0,
          currentLearning: record.currentLearning || 0,
          finishedLearning: record.finishedLearning || 0
        });
      }
      
      // Make sure current user is included only if they're logged in
      if (currentUserId && !processedUserIds.has(currentUserId)) {
        try {
          // Try to get user's study record
          const userRecord = await RecordService.getStudyRecordById(currentUserId);
          
          if (userRecord) {
            // Check if the record has a nested user object
            const userProfile = userRecord.user || {};
            
            // Try multiple potential field names for username and gender
            const username = userRecord.username || userRecord.name || 
                             userProfile.username || userProfile.name || 
                             user.name || user.username || user.email?.split('@')[0] || 'You';
                             
            const gender = userRecord.gender || userProfile.gender || user.gender || 'Not specified';
            
            userRankings.push({
              userId: currentUserId,
              username: username,
              gender: gender,
              score: userRecord.totalScore || 0,
              currentLearning: userRecord.currentLearning || 0,
              finishedLearning: userRecord.finishedLearning || 0
            });
          } else {
            // No study record, add with zero values
            userRankings.push({
              userId: currentUserId,
              username: user.name || user.username || user.email?.split('@')[0] || 'You',
              gender: user.gender || 'Not specified',
              score: 0,
              currentLearning: 0,
              finishedLearning: 0
            });
          }
        } catch (error) {
          // Error getting study record, add with zero values
          userRankings.push({
            userId: currentUserId,
            username: user.name || user.username || user.email?.split('@')[0] || 'You',
            gender: user.gender || 'Not specified',
            score: 0,
            currentLearning: 0,
            finishedLearning: 0
          });
        }
      }
      
      // Sort by score (descending)
      const sortedRankings = userRankings.sort((a, b) => b.score - a.score);
      setRankings(sortedRankings);
      
      // Find current user's rank
      if (currentUserId) {
        const userRank = sortedRankings.findIndex(item => item.userId === currentUserId);
        
        if (userRank >= 0) {
          setCurrentUserRank(userRank + 1); // +1 because array is 0-indexed
        }
      } else {
        // Reset current user rank if no user is logged in
        setCurrentUserRank(null);
      }
    } catch (error) {
      console.error('Error in fetchRankings:', error);
      setError('An error occurred while loading rankings. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchRankings();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings(true);
  };
  
  // Header for the table
  const renderTableHeader = () => (
    <View>
      <Header title="Student Community" />
      
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.rankColumn]}>Rank</Text>
        <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
        <Text style={[styles.headerText, styles.genderColumn]}>Gender</Text>
        <Text style={[styles.headerText, styles.progressColumn]}>Progress*</Text>
      </View>
    </View>
  );
  
  // Table row item
  const renderRankingItem = ({ item, index }) => {
    const isCurrentUser = currentUser && 
      (item.userId === currentUser.id || item.userId === currentUser._id);
    
    // Make sure we have something to display for username
    const displayName = item.username || `User ${item.userId.substring(0, 5)}`;
      
    return (
      <View style={[
        styles.tableRow,
        isCurrentUser && styles.highlightedRow
      ]}>
        <Text style={[styles.cellText, styles.rankColumn]}>{index + 1}</Text>
        <Text 
          style={[styles.cellText, styles.nameColumn, isCurrentUser && styles.currentUserText]}
          numberOfLines={1}
        >
          {displayName}{isCurrentUser ? ' (You)' : ''}
        </Text>
        <Text style={[styles.cellText, styles.genderColumn]}>
          {item.gender || 'Not specified'}
        </Text>
        <Text style={[styles.cellText, styles.progressColumn]}>
          {item.score}({item.currentLearning})({item.finishedLearning})
        </Text>
      </View>
    );
  };
  
  const renderFooterNote = () => (
    <View style={styles.footerNote}>
      <Text style={styles.footerText}>
        * The Progress shows Total Score (Current Learning) (Finished)
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
  
  if (error && !refreshing) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => fetchRankings()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
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
      <FlatList
        data={rankings}
        renderItem={renderRankingItem}
        keyExtractor={(item, index) => `rank-${index}-${item.userId || index}`}
        ListHeaderComponent={renderTableHeader}
        ListFooterComponent={renderFooterNote}
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
      
      {/* Show user rank info when logged in */}
      {currentUserRank && (
        <View style={styles.yourRankContainer}>
          <Text style={styles.yourRankText}>
            Your Rank: {currentUserRank} of {rankings.length}
          </Text>
        </View>
      )}
      
      {/* Show login prompt when not logged in */}
      {!currentUser && rankings.length > 0 && (
        <TouchableOpacity 
          style={styles.loginContainer}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={styles.loginText}>
            Log in to see your ranking
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// Styling for the table layout
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.medium,
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  highlightedRow: {
    backgroundColor: Colors.highlight,
  },
  headerText: {
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontSize: Typography.sizes.small,
  },
  cellText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.small,
  },
  currentUserText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  rankColumn: {
    width: 40,
    textAlign: 'center',
  },
  nameColumn: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
  },
  genderColumn: {
    width: 70,
    textAlign: 'center',
  },
  progressColumn: {
    width: 100,
    textAlign: 'right',
  },
  footerNote: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cardBackground,
  },
  footerText: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
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
  loginContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: 'white',
  },
});

export default CommunityScreen; 
