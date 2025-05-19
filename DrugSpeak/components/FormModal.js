import React from 'react';
import { View, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Spacing } from '../constants/color';
import { PrimaryButton, SecondaryButton } from './Button';
import FormContainer from './FormContainer';
import FormTitle from './FormTitle';

const FormModal = ({
   visible,
   onClose,
   onSubmit,
   title,
   children,
   isLoading = false,
   submitTitle = "Confirm",
   cancelTitle = "Cancel",
   backdropDismiss = true
   }) => {
   const handleBackdropPress = () => {
      if (backdropDismiss && !isLoading) {
         onClose();
      }
   };

   return (
      <Modal
         visible={visible}
         transparent
         animationType="fade"
         onRequestClose={onClose}
      >
         <TouchableWithoutFeedback onPress={handleBackdropPress}>
         <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
               <View style={styles.modalWrapper}>
               <FormContainer style={styles.formContainer}>
                  <FormTitle title={title} />
                  
                  {children}
                  
                  <View style={styles.modalButtons}>
                     <SecondaryButton
                     title={cancelTitle}
                     onPress={onClose}
                     disabled={isLoading}
                     style={styles.actionButton}
                     />
                     
                     <PrimaryButton
                     title={submitTitle}
                     loading={isLoading}
                     onPress={onSubmit}
                     disabled={isLoading}
                     style={styles.actionButton}
                     />
                  </View>
               </FormContainer>
               </View>
            </TouchableWithoutFeedback>
         </View>
         </TouchableWithoutFeedback>
      </Modal>
   );
   };

   const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
   },
   modalWrapper: {
      width: '100%',
      paddingHorizontal: Spacing.lg,
   },
   formContainer: {
      flex: 0,
      padding: 0,
   },
   modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.lg,
   },
   actionButton: {
      marginHorizontal: Spacing.sm,
      flex: 1,
   }
});

export default FormModal;
