import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../constants/globalStyles';

const Header = ({ date, onSettingsPress, onCalendarPress, onHomePress, showHomeIcon }) => {
  if (showHomeIcon) {
    return (
      <View style={styles.header.singleIconContainer}>
        <TouchableOpacity onPress={onHomePress}>
          <Ionicons name="home-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.header.container}>
      <TouchableOpacity onPress={onSettingsPress}>
        <Ionicons name="settings-outline" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.header.date}>{date}</Text>
      <TouchableOpacity onPress={onCalendarPress}>
        <Ionicons name="calendar-outline" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;