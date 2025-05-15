import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const RecordingItem = ({ 
   recording, 
   playingRecordingId, 
   onPlayPress, 
   onDeletePress,
   formatTimestamp 
}) => (
   <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Colors.cardBackground,
      borderRadius: Borders.radius.medium,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: Colors.border,
   }}>
      <TouchableOpacity
         style={{
         padding: Spacing.sm,
         borderRadius: 20,
         backgroundColor: playingRecordingId === recording.id ? Colors.error : Colors.primary,
         marginRight: Spacing.md,
         }}
         onPress={() => onPlayPress(recording.id)}
      >
         <Icon
         name={playingRecordingId === recording.id ? "stop" : "play-arrow"}
         size={24}
         color="white"
         />
      </TouchableOpacity>
      
      <View style={{ flex: 1 }}>
         <Text style={{
         fontSize: Typography.sizes.small,
         color: Colors.textSecondary,
         marginBottom: 2,
         }}>
         {formatTimestamp(recording.timestamp)}
         </Text>
         
         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
         <Text style={{
            fontSize: Typography.sizes.body,
            fontWeight: Typography.weights.medium,
            color: Colors.textPrimary,
         }}>
            My Recording
         </Text>
         </View>
      </View>
      
      <TouchableOpacity
         style={{
         padding: Spacing.sm,
         borderRadius: 20,
         }}
         onPress={() => onDeletePress(recording.id)}
      >
         <Icon
         name="delete"
         size={24}
         color={Colors.error}
         />
      </TouchableOpacity>
   </View>
);

export default RecordingItem;
