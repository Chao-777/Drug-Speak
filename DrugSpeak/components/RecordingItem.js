import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography } from '../constants/color';

const RecordingItem = ({ 
  recording, 
  playingRecordingId, 
  onPlayPress, 
  onDeletePress,
  onEvaluatePress,
  formatTimestamp,
  isEvaluating
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.playButton}
      onPress={() => onPlayPress(recording.id)}
      disabled={isEvaluating}
    >
      <Icon
        name={playingRecordingId === recording.id ? "stop" : "play-arrow"}
        size={24}
        color="white"
      />
    </TouchableOpacity>
    
    <View style={styles.infoContainer}>
      <Text style={styles.timestamp}>
        {formatTimestamp(recording.timestamp)}
        {recording.score !== undefined && (
          <Text style={styles.score}> ({recording.score})</Text>
        )}
      </Text>
    </View>
    
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onDeletePress(recording.id)}
        disabled={isEvaluating}
      >
        <Icon name="delete" size={22} color={Colors.error} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onEvaluatePress(recording.id)}
        disabled={isEvaluating}
      >
        {isEvaluating ? (
          <ActivityIndicator size="small" color={Colors.secondary} />
        ) : (
          <Icon name="equalizer" size={22} color={Colors.secondary} />
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContainer: {
    flex: 1,
  },
  timestamp: {
    fontSize: Typography.sizes.body,
    color: Colors.textPrimary,
  },
  score: {
    fontWeight: Typography.weights.bold,
    color: Colors.secondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
});

export default RecordingItem;
