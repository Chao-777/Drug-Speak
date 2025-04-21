import React, { useState } from 'react';
import { Audio } from 'expo-av';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Borders } from '../constants/color';
import { drugAudioMap } from '../data/drugAudioMap';


const CardContainer = styled.View`
   flex-direction: row;
   align-items: center;
   padding-vertical: ${Spacing.md}px;
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const PlayButton = styled.TouchableOpacity`
   padding: ${Spacing.md}px;
`;

const DrugInfoContainer = styled.View`
   flex: 1;
   flex-direction: row;
   align-items: center;
`;

const DrugName = styled.Text`
   font-size: 16px;
   margin-left: ${Spacing.sm}px;
   color: ${Colors.textPrimary};
`;

const GenderIcon = styled(FAIcon)`
   margin-left: ${Spacing.sm}px;
`;

const SpeedSelectorContainer = styled.View`
   position: relative;
   margin-left: ${Spacing.sm}px;
`;

const SpeedSelector = styled.TouchableOpacity`
   flex-direction: row;
   align-items: center;
   border-width: ${Borders.width.thin}px;
   border-color: ${Colors.border};
   border-radius: ${Borders.radius.small}px;
   padding: ${Spacing.xs}px;
   margin-left: ${Spacing.xs}px;
`;

const SpeedText = styled.Text`
   margin-right: ${Spacing.xs}px;
   color: ${Colors.textSecondary};
`;

const SpeedDropdown = styled.View`
   position: absolute;
   top: 100%;
   right: 0;
   background-color: ${Colors.cardBackground};
   border-width: ${Borders.width.thin}px;
   border-color: ${Colors.border};
   border-radius: ${Borders.radius.small}px;
   z-index: 1000;
`;

const SpeedOption = styled.TouchableOpacity`
   padding: ${Spacing.md}px;
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const SpeedOptionText = styled.Text`
   color: ${Colors.textPrimary};
`;

const PronunciationCard = ({ drugName, gender }) => {
   const [selectedSpeed, setSelectedSpeed] = useState('1.0');
   const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

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
      <CardContainer>
         <PlayButton onPress={() => playAudio(drugName, gender)}>
            <Icon name="volume-up" size={24} color={Colors.textPrimary} />
         </PlayButton> 

         <DrugInfoContainer>
            <DrugName>{drugName}</DrugName>
            <GenderIcon
               name={gender === 'female' ? 'venus' : 'mars'}
               size={20}
               color={gender === 'female' ? '#d63384' : '#0d6efd'}
            />
         </DrugInfoContainer>

         <SpeedSelectorContainer>
            <SpeedSelector onPress={() => setSpeedMenuOpen(!speedMenuOpen)}>
               <SpeedText>{selectedSpeed}</SpeedText>
               <Icon name="arrow-drop-down" size={24} color={Colors.textSecondary} />
            </SpeedSelector>

            {speedMenuOpen && (
               <SpeedDropdown>
                  {['0.25', '0.5', '0.75', '1.0'].map((speed) => (
                     <SpeedOption
                        key={speed}
                        onPress={() => {
                           setSelectedSpeed(speed);
                           setSpeedMenuOpen(false);
                        }}
                     >
                        <SpeedOptionText>{speed}</SpeedOptionText>
                     </SpeedOption>
                  ))}
               </SpeedDropdown>
            )}
         </SpeedSelectorContainer>
      </CardContainer>
   );
};

export default PronunciationCard;
