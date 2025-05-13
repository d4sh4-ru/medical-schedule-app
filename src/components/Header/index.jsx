import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../constants/globalStyles';

const Header = ({
  title,
  centerTextStyle = styles.header.date,
  leftIconName,
  onLeftPress,
  rightIconName,
  onRightPress,
}) => {
  const renderIcon = (iconName, onPress) => {
    if (!iconName) return <View style={{ width: 24 }} />;

    return (
      <TouchableOpacity onPress={onPress}>
        <Ionicons name={iconName} size={24} color="#000" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.header.container}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>
        {renderIcon(leftIconName, onLeftPress)}
      </View>

      <Text style={centerTextStyle}>{title}</Text>

      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        {renderIcon(rightIconName, onRightPress)}
      </View>
    </View>
  );
};

export default Header;
