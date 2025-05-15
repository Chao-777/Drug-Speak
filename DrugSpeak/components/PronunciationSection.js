import React from 'react';
import { View, Text } from 'react-native';
import { Typography, Colors, Spacing } from '../constants/color';
import PronunciationCard from './PronunciationCard';

const PronunciationSection = ({ drug, openDropdownId, handleToggleDropdown }) => {
   return (
      <View>
         <Text style={{
         fontSize: Typography.sizes.subtitle,
         fontWeight: Typography.weights.bold,
         color: Colors.textPrimary,
         marginBottom: Spacing.sm,
         }}>
         Pronunciation
         </Text>
         {drug.sounds && drug.sounds.map((sound) => (
         <PronunciationCard 
            key={`${drug.id}_${sound.gender}`}
            id={`${drug.id}_${sound.gender}`}
            drugName={drug.name} 
            gender={sound.gender}
            audioFile={sound.file}
            isDropdownOpen={openDropdownId === `${drug.id}_${sound.gender}`} 
            onToggleDropdown={handleToggleDropdown} 
         />
         ))}
      </View>
   );
};

export default PronunciationSection;
