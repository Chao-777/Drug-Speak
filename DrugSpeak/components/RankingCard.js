import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Typography, Spacing, Shadows } from '../constants/color';

const RankingCard = ({ 
  rank, 
  user, 
  score, 
  isCurrentUser,
  progress = 0 // Default to 0 if not provided
}) => (
  <View style={[
    styles.container, 
    isCurrentUser && styles.highlightedContainer
  ]}>
    <View style={styles.rankContainer}>
      {rank <= 3 ? (
        <Icon 
          name="emoji-events" 
          size={24} 
          color={
            rank === 1 ? '#FFD700' : 
            rank === 2 ? '#C0C0C0' : 
            '#CD7F32'
          } 
        />
      ) : (
        <Text style={styles.rankText}>{rank}</Text>
      )}
    </View>
    
    <View style={styles.userInfo}>
      <Text 
        style={[
          styles.userName, 
          isCurrentUser && styles.currentUserText
        ]}
        numberOfLines={1}
      >
        {user.name || user.email?.split('@')[0] || 'Anonymous'}
        {isCurrentUser && ' (You)'}
      </Text>
      
      <View style={styles.userDetails}>
        <Text style={styles.detailText}>
          {user.gender || 'Not specified'} • {progress}% completed
        </Text>
      </View>
    </View>
    
    <View style={styles.scoreContainer}>
      <Text style={styles.scoreText}>{score}</Text>
      <Text style={styles.scoreLabel}>points</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 8,
    padding: Spacing.md,
    ...Shadows.glassSmall
  },
  highlightedContainer: {
    backgroundColor: Colors.highlight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  rankText: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  userInfo: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  userName: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  currentUserText: {
    color: Colors.primary,
  },
  userDetails: {
    marginTop: 2,
  },
  detailText: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: Typography.sizes.medium,
    fontWeight: Typography.weights.bold,
    color: Colors.secondary,
  },
  scoreLabel: {
    fontSize: Typography.sizes.small,
    color: Colors.textSecondary,
  },
});

export default RankingCard; 
