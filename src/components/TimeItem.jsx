import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import styles from '../constants/globalStyles';

const TimeItem = ({ time, index, onSelect, onRemove, formatTime, canRemove }) => {
  return (
    <View style={styles.timeItem.container}>
      <TouchableOpacity
        style={styles.timeItem.timeButton}
        onPress={() => onSelect(index, time)}
      >
        <Text style={styles.timeItem.timeText}>{formatTime(time)}</Text>
      </TouchableOpacity>
      {canRemove && (
        <TouchableOpacity
          style={styles.timeItem.deleteButton}
          onPress={() => onRemove(index)}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M6 6l12 12M18 6L6 18"
              stroke="#d32f2f"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default TimeItem;