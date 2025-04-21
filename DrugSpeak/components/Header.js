import React from 'react';
import styled from 'styled-components/native';
import { Colors, Spacing, Typography, Borders } from '../constants/color';

const HeaderContainer = styled.View`
   background-color: ${Colors.secondary};
   padding: ${Spacing.md}px;
   align-items: center;
   border-bottom-width: ${Borders.width.thin}px;
   border-bottom-color: ${Colors.border};
`;

const HeaderTitle = styled.Text`
   font-size: ${Typography.sizes.title}px;
   font-weight: ${Typography.weights.bold};
   color: ${Colors.textPrimary};
`;

const Header = ({ title }) => {
   return (
      <HeaderContainer>
         <HeaderTitle>
            {title}
         </HeaderTitle>
      </HeaderContainer>
   );
};

export default Header;
