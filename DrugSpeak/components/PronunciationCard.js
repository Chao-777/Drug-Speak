import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Modal } from 'react-native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Typography, Borders, Shadows } from '../constants/color';
import { drugAudioMap } from '../data/drugAudioMap';

const PronunciationCard = ({ id, drugName, gender, audioFile, isDropdownOpen, onToggleDropdown }) => {
   const [selectedSpeed, setSelectedSpeed] = useState('1.0');
   const [sound, setSound] = useState(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
   const speedButtonRef = useRef(null);
   
   const DROPDOWN_WIDTH = 80;

   useEffect(() => {
      return () => {
         if (sound) {
            sound.unloadAsync();
         }
      };
   }, [sound]);

   const playAudio = async (drugName, gender) => {
      try {
         setIsLoading(true);
         
         if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
            setSound(null);
         }
         
         const audioFile = drugAudioMap[drugName]?.audio?.[gender];
      
         if (!audioFile) {
            console.warn(`Audio not found for ${drugName} - ${gender}`);
            setIsLoading(false);
            return;
         }
         
         const { sound: newSound } = await Audio.Sound.createAsync(
            audioFile,
            { shouldPlay: false }
         );
         
         setSound(newSound);
         
         const speedValue = parseFloat(selectedSpeed);
         await newSound.setRateAsync(speedValue, true);
         
         newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
               setIsPlaying(false);
            }
         });
         
         await newSound.playAsync();
         setIsPlaying(true);
         
      } catch (error) {
         console.error('Error playing audio:', error);
      } finally {
         setIsLoading(false);
      }
   };
   
   const stopAudio = async () => {
      if (sound) {
         await sound.stopAsync();
         setIsPlaying(false);
      }
   };
   
   const handleSpeedChange = async (speed) => {
      setSelectedSpeed(speed);
      
      if (sound && isPlaying) {
         const speedValue = parseFloat(speed);
         await sound.stopAsync();
         await sound.setRateAsync(speedValue, true);
         await sound.playAsync();
      }
      
      onToggleDropdown(null);
   };

   const measureDropdownPosition = () => {
      if (speedButtonRef.current) {
         speedButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
            setDropdownPosition({
               x: pageX,
               y: pageY + height
            });
            onToggleDropdown(id);
         });
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
         }}
      >
         <TouchableOpacity 
            onPress={isPlaying ? stopAudio : () => playAudio(drugName, gender)}
            disabled={isLoading}
         >
            {isLoading ? (
               <Icon name="hourglass-empty" size={24} color={Colors.textLight} />
            ) : isPlaying ? (
               <Icon name="stop" size={24} color={Colors.error} />
            ) : (
               <Icon name="volume-up" size={24} color={Colors.primary} />
            )}
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

         <View style={{ position: 'relative', marginLeft: Spacing.sm }}>
            <TouchableOpacity
               ref={speedButtonRef}
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
               onPress={measureDropdownPosition}
            >
               <Text style={{ color: Colors.textSecondary, fontSize: Typography.sizes.small }}>
                  {selectedSpeed}x
               </Text>
               <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
         </View>

         <Modal
            transparent={true}
            visible={isDropdownOpen}
            onRequestClose={() => onToggleDropdown(null)}
            animationType="none"
         >
            <TouchableOpacity 
               style={{ flex: 1 }}
               activeOpacity={1}
               onPress={() => onToggleDropdown(null)}
            >
               <View
                  style={{
                     position: 'absolute',
                     top: dropdownPosition.y,
                     left: dropdownPosition.x,
                     backgroundColor: 'white',
                     borderWidth: Borders.width.thin,
                     borderColor: Colors.border,
                     borderRadius: Borders.radius.small,
                     ...Shadows.medium, 
                     width: DROPDOWN_WIDTH,
                     elevation: 8,
                  }}
               >
                  {['0.25', '0.5', '0.75', '1.0', '1.25', '1.5', '2.0'].map((speed) => (
                     <TouchableOpacity
                        key={speed}
                        style={{
                           padding: Spacing.md,
                           borderBottomWidth: speed !== '2.0' ? Borders.width.thin : 0,
                           borderBottomColor: Colors.border,
                           backgroundColor: selectedSpeed === speed ? Colors.primaryLight : 'white',
                           alignItems: 'center', 
                        }}
                        onPress={() => handleSpeedChange(speed)}
                     >
                        <Text
                           style={{
                              color: selectedSpeed === speed ? Colors.textLight : Colors.textSecondary,
                              fontWeight: selectedSpeed === speed ? Typography.weights.bold : Typography.weights.regular,
                              fontSize: Typography.sizes.small,
                           }}
                        >
                           {speed}x
                        </Text>
                     </TouchableOpacity>
                  ))}
               </View>
            </TouchableOpacity>
         </Modal>
      </View>
   );
};

export default PronunciationCard;
