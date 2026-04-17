import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/color';


const LoadingIndicator = ({ 
  message = "Loading...", 
  size = "large", 
  fullScreen = false,
  color = Colors.primary,
  textStyle = {},
  containerStyle = {}
}) => {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, containerStyle]}>
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text style={[styles.text, textStyle]}>
            {message}
          </Text>
        )}
      </View>
    );
  }
  
  // Otherwise use the standard container
  return (
    <View style={[styles.container, containerStyle]}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={[styles.text, textStyle]}>
          {message}
        </Text>
      )}
    </View>
  );
};

// Convenience components for common loading patterns
LoadingIndicator.Inline = (props) => (
  <LoadingIndicator 
    size="small" 
    message={null} 
    containerStyle={styles.inlineContainer} 
    {...props} 
  />
);

LoadingIndicator.Overlay = (props) => (
  <View style={styles.overlayContainer}>
    <View style={styles.overlay}>
      <LoadingIndicator {...props} />
    </View>
  </View>
);

LoadingIndicator.FullScreen = (props) => (
  <LoadingIndicator 
    fullScreen={true} 
    {...props} 
  />
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    marginLeft: Spacing.md,
    fontSize: Typography.sizes.body,
    color: Colors.textSecondary,
  },
  inlineContainer: {
    padding: 0,
    marginHorizontal: Spacing.sm,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: Colors.cardBackground,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  }
});

export default LoadingIndicator; 
