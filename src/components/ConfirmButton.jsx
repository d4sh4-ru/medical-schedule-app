import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../constants/globalStyles';

const ConfirmButton = ({ onPress }) => {
  return (
    <View style={styles.confirmButton.container}>
      <TouchableOpacity style={styles.confirmButton.button} onPress={onPress}>
        <Text style={styles.confirmButton.buttonText}>Подтвердить</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfirmButton;