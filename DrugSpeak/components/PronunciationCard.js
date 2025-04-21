import React, { useState } from 'react';
import { Audio } from 'expo-av';
import { 
   View, 
   Text, 
   TouchableOpacity 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Borders } from '../constants/color';

const PronunciationCard = ({ drugName, gender, audioFile }) => {
   const [selectedSpeed, setSelectedSpeed] = useState('1.0');
   const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

   const playAudio = async () => {
      try {
         const { sound } = await Audio.Sound.createAsync(
            audioFile,
            { shouldPlay: true }
         );
         await sound.playAsync();
      } catch (error) {
         console.error('Error playing audio:', error);
      }
   };

   return (
      <View style={{
         flexDirection: 'row',
         alignItems: 'center',
         paddingVertical: Spacing.md,
         borderBottomWidth: Borders.width.thin,
         borderBottomColor: Colors.border
      }}>
         <TouchableOpacity 
            onPress={playAudio} 
            style={{ padding: Spacing.md }}
         >
            <Icon name="volume-up" size={24} color={Colors.textPrimary} />
         </TouchableOpacity>

         <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
               fontSize: 16,
               marginLeft: Spacing.sm,
               color: Colors.textPrimary
            }}>
               {drugName}
            </Text>
            <FAIcon
               name={gender === 'female' ? 'venus' : 'mars'}
               size={20}
               color={gender === 'female' ? '#d63384' : '#0d6efd'}
               style={{ marginLeft: Spacing.sm }}
            />
         </View>

         <View style={{ position: 'relative', marginLeft: Spacing.sm }}>
            <TouchableOpacity
               style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: Borders.width.thin,
                  borderColor: Colors.border,
                  borderRadius: Borders.radius.small,
                  padding: Spacing.xs,
                  marginLeft: Spacing.xs
               }}
               onPress={() => setSpeedMenuOpen(!speedMenuOpen)}
            >
               <Text style={{ 
                  marginRight: Spacing.xs,
                  color: Colors.textSecondary
               }}>
                  {selectedSpeed}
               </Text>
               <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            {speedMenuOpen && (
               <View style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  backgroundColor: Colors.cardBackground,
                  borderWidth: Borders.width.thin,
                  borderColor: Colors.border,
                  borderRadius: Borders.radius.small,
                  zIndex: 1000
               }}>
                  {['0.25', '0.5', '0.75', '1.0'].map((speed) => (
                     <TouchableOpacity
                        key={speed}
                        style={{
                           padding: Spacing.md,
                           borderBottomWidth: Borders.width.thin,
                           borderBottomColor: Colors.border
                        }}
                        onPress={() => {
                           setSelectedSpeed(speed);
                           setSpeedMenuOpen(false);
                        }}
                     >
                        <Text style={{ color: Colors.textPrimary }}>{speed}</Text>
                     </TouchableOpacity>
                  ))}
               </View>
            )}
         </View>
      </View>
   );
};

export default PronunciationCard;
