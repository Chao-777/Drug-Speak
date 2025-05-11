export const Colors = {
   primary: '#FF7E33',
   primaryDark: '#E05E00',
   primaryLight: '#FFA366',
   
   secondary: 'rgba(255, 255, 255, 0.85)', 
   secondaryDark: 'rgba(230, 230, 230, 0.85)',
   secondaryLight: 'rgba(255, 255, 255, 0.95)',
   
   textPrimary: '#333333',
   textSecondary: '#666666',
   textLight: '#999999',
   
   success: '#4CAF50',
   warning: '#FF9800', 
   error: '#F44336',
   info: '#2196F3',
   
   background: '#F9F9F9',
   cardBackground: 'rgba(255, 255, 255, 0.75)', 
   
   male: {
      background: 'rgba(230, 242, 255, 0.8)',
      text: '#0066cc'
   },
   female: {
      background: 'rgba(255, 230, 242, 0.8)',
      text: '#cc0066'
   },
   
   border: 'rgba(221, 221, 221, 0.5)',
   
   
   glass: {
      background: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(255, 255, 255, 0.2)',
      shadow: 'rgba(0, 0, 0, 0.1)'
   }
};

export const Spacing = {
   xs: 5,
   sm: 10,
   md: 15,
   lg: 20,
   xl: 30,
   xxl: 40,
};

export const Typography = {
   fontFamily: {
      inter: 'Inter',
      interLight: 'Inter-Light',
      interRegular: 'Inter-Regular',
      interMedium: 'Inter-Medium',
      interSemiBold: 'Inter-SemiBold',
      interBold: 'Inter-Bold',
   },
   sizes: {
      small: 12,
      body: 16,
      subtitle: 18,
      title: 20,
      heading: 24,
      large: 30,
   },
   weights: {
      light: '300',
      regular: 'normal',
      medium: '500',
      semiBold: '600',
      bold: 'bold',
   },
};

export const Shadows = {
   glassSmall: {
      shadowColor: '#333333',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
   },
   glassMedium: {
      shadowColor: '#FF7E33',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 5,
   },
   glassLarge: {
      shadowColor: '#FF7E33',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 8,
   },

   small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 2,
   },
   medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
   },
   large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
   },
};

export const Borders = {
   radius: {
      small: 3,
      medium: 8,
      large: 12,
      round: 50,
   },
   width: {
      thin: 0.5,
      normal: 1,
      thick: 2,
   },
};


export const theme = {
   colors: Colors,
   spacing: Spacing,
   typography: Typography,
   shadows: Shadows,
   borders: Borders
};

export default theme;
