import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const PrimaryButton = ({ 
   onPress, 
   title = "SUBMIT", 
   icon, 
   iconSize = 20,
   iconPosition = "left", 
   style,
   textStyle,
   disabled = false,
   loading = false  
}) => {
   return (
      <TouchableOpacity 
      style={[{
         backgroundColor: disabled ? Colors.textLight : Colors.primary,
         paddingVertical: Spacing.lg,
         paddingHorizontal: Spacing.xl,
         marginHorizontal: Spacing.lg,
         marginVertical: Spacing.lg,
         borderRadius: Borders.radius.round,
         alignItems: 'center',
         flexDirection: 'row',
         justifyContent: 'center',
         opacity: disabled ? 0.7 : 1,
      }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      >
      {loading ? (
         <ActivityIndicator size="small" color={Colors.textLight} />
      ) : (
         <>
            {icon && iconPosition === "left" && (
            <Icon 
               name={icon} 
               size={iconSize} 
               color={Colors.textLight} 
               style={{ marginRight: Spacing.sm }}
            />
            )}
            
            <Text style={[{
            color: Colors.textLight,
            fontWeight: Typography.weights.bold,
            fontSize: Typography.sizes.body
            }, textStyle]}>
            {title}
            </Text>
            
            {icon && iconPosition === "right" && (
            <Icon 
               name={icon} 
               size={iconSize} 
               color={Colors.textLight} 
               style={{ marginLeft: Spacing.sm }}
            />
            )}
         </>
      )}
      </TouchableOpacity>
   );
};

const SecondaryButton = ({ 
   onPress, 
   title = "CANCEL", 
   icon, 
   iconSize = 20,
   iconPosition = "left", 
   style,
   textStyle,
   disabled = false,
   loading = false
}) => {
   return (
      <TouchableOpacity 
      style={[{
         backgroundColor: 'transparent',
         paddingVertical: Spacing.lg,
         paddingHorizontal: Spacing.xl,
         marginHorizontal: Spacing.lg,
         marginVertical: Spacing.lg,
         borderRadius: Borders.radius.round,
         alignItems: 'center',
         flexDirection: 'row',
         justifyContent: 'center',
         borderWidth: Borders.width.normal,
         borderColor: disabled ? Colors.textLight : Colors.secondary,
         opacity: disabled ? 0.7 : 1,
      }, style]}
      onPress={onPress}
      disabled={disabled || loading}
   >
      {loading ? (
         <ActivityIndicator size="small" color={Colors.secondary} />
      ) : (
         <>
            {icon && iconPosition === "left" && (
            <Icon 
               name={icon} 
               size={iconSize} 
               color={disabled ? Colors.textLight : Colors.secondary} 
               style={{ marginRight: Spacing.sm }}
            />
            )}
            
            <Text style={[{
            color: disabled ? Colors.textLight : Colors.secondary,
            fontWeight: Typography.weights.bold,
            fontSize: Typography.sizes.body
            }, textStyle]}>
               {title}
            </Text>
            
            {icon && iconPosition === "right" && (
               <Icon 
               name={icon} 
               size={iconSize} 
               color={disabled ? Colors.textLight : Colors.secondary} 
               style={{ marginLeft: Spacing.sm }}
               />
            )}
         </>
         )}
      </TouchableOpacity>
   );
};

const RecordButton = ({ isRecording, onPressIn, onPressOut }) => {
   return (
      <TouchableOpacity 
      style={{
         width: 120,
         height: 120,
         borderRadius: 60,
         backgroundColor: isRecording ? Colors.error : Colors.secondary, 
         justifyContent: 'center',
         alignItems: 'center',
         alignSelf: 'center',
         marginBottom: Spacing.md,
      }}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      >
      <Text style={{
         color: Colors.textLight, 
         fontWeight: Typography.weights.bold,
         fontSize: Typography.sizes.body,
         textAlign: 'center',
      }}>
         {isRecording ? 'Recording...' : 'Hold to Record'}
      </Text>
      </TouchableOpacity>
   );
};

export { PrimaryButton, SecondaryButton, RecordButton };
