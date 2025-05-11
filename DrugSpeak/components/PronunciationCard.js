import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';
import { drugAudioMap } from '../data/drugAudioMap';

const PronunciationCard = ({ id, drugName, gender, audioFile, isDropdownOpen, onToggleDropdown }) => {
   const [selectedSpeed, setSelectedSpeed] = useState('1.0');
   
   const DROPDOWN_WIDTH = 80;

   const playAudio = async (drugName, gender) => {
      try {
         const audioFile = drugAudioMap[drugName]?.audio?.[gender];
      
         if (!audioFile) {
            console.warn(`Audio not found for ${drugName} - ${gender}`);
            return;
         }
      
         const { sound } = await Audio.Sound.createAsync(audioFile, { shouldPlay: true });
         await sound.playAsync();
      } catch (error) {
         console.error('Error playing audio:', error);
      }
   };

   return (
      <View
         style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.cardBackground,
            padding: Spacing.md,
            marginVertical: Spacing.sm,
            borderRadius: Borders.radius.medium,
            borderBottomWidth: Borders.width.thin,
            borderBottomColor: Colors.border,
            ...Shadows.glassSmall,
            zIndex: isDropdownOpen ? 10 : 1 
         }}
      >
         <TouchableOpacity 
            style={{
               padding: Spacing.md,
            }}
            onPress={() => playAudio(drugName, gender)}
         >
            <Icon name="volume-up" size={24} color={Colors.primary} />
         </TouchableOpacity>

         <View
            style={{
               flex: 1,
               flexDirection: 'row',
               alignItems: 'center',
            }}
         >
            <Text
               style={{
                  fontSize: Typography.sizes.body,
                  fontWeight: Typography.weights.medium,
                  color: Colors.textPrimary,
                  marginLeft: Spacing.sm,
               }}
            >
               {drugName}
            </Text>
            
            <FAIcon
               name={gender === 'female' ? 'venus' : 'mars'}
               size={20}
               color={gender === 'female' ? Colors.female.text : Colors.male.text}
               style={{ marginLeft: Spacing.sm }}
            />
         </View>

         <View
            style={{
               position: 'relative',
               marginLeft: Spacing.sm,
               zIndex: 2 
            }}
         >
            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: Borders.width.thin,
                  borderColor: Colors.border,
                  borderRadius: Borders.radius.small,
                  padding: Spacing.xs,
                  paddingHorizontal: Spacing.sm, 
                  marginLeft: Spacing.xs,
                  backgroundColor: 'white',
                  width: DROPDOWN_WIDTH, 
               }}
               onPress={() => onToggleDropdown(id)}
            >
               <Text
                  style={{
                     color: Colors.textSecondary,
                     fontSize: Typography.sizes.small,
                  }}
               >
                  {selectedSpeed}
               </Text>
               <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            {isDropdownOpen && (
               <View
                  style={{
                     position: 'absolute',
                     top: '100%',
                     right: 0,
                     backgroundColor: 'white',
                     borderWidth: Borders.width.thin,
                     borderColor: Colors.border,
                     borderRadius: Borders.radius.small,
                     zIndex: 1000, 
                     elevation: 5,   
                     ...Shadows.medium, 
                     width: DROPDOWN_WIDTH, 
                  }}
               >
                  {['0.25', '0.5', '0.75', '1.0'].map((speed) => (
                     <TouchableOpacity
                        key={speed}
                        style={{
                           padding: Spacing.md,
                           borderBottomWidth: speed !== '1.0' ? Borders.width.thin : 0,
                           borderBottomColor: Colors.border,
                           backgroundColor: 'white',
                           alignItems: 'center', 
                        }}
                        onPress={() => {
                           setSelectedSpeed(speed);
                           onToggleDropdown(null); 
                        }}
                     >
                        <Text
                           style={{
                              color: Colors.textPrimary,
                              fontSize: Typography.sizes.small,
                           }}
                        >
                           {speed}
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            )}
         </View>
      </View>
   );
};

export default PronunciationCard;
