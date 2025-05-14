import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import TimeItem from './TimeItem';
import styles from '../constants/globalStyles';

const TimeGrid = ({ times, onSelectTime, onRemoveTime, onAddTime, formatTime }) => {
  const renderTimes = () => {
    const rows = [];
    for (let row = 0; row < 3; row++) {
      const columns = [];
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        if (index < times.length) {
          columns.push(
            <View key={index} style={styles.timeGrid.column}>
              <TimeItem
                time={times[index]}
                index={index}
                onSelect={() => onSelectTime(index, times[index])}
                onRemove={onRemoveTime}
                formatTime={formatTime}
                canRemove={times.length > 1}
              />
            </View>
          );
        } else {
          columns.push(<View key={index} style={styles.timeGrid.emptyColumn} />);
        }
      }
      rows.push(
        <View key={row} style={styles.timeGrid.row}>
          {columns}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.timeGrid.container}>
      {renderTimes()}
      <TouchableOpacity style={styles.timeGrid.addButton} onPress={onAddTime}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export default TimeGrid;