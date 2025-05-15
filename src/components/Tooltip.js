import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Modal, Pressable, StyleSheet, Dimensions } from 'react-native';
import styles from '../../constants/globalStyles';
import { useTheme } from '../../theme/ThemeProvider';

// Размеры экрана для адаптивности
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Tooltip = ({ children, content, position = 'bottom', offsetX = 0, offsetY = 0 }) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef(null);

  // Вычисление позиции тултипа
  const showTooltip = () => {
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        let tooltipX = x + width / 2 + offsetX;
        let tooltipY = y + height + offsetY;

        // Настройка позиции в зависимости от параметра position
        if (position === 'top') {
          tooltipY = y - 100 - offsetY; // Предполагаем высоту тултипа ~100
        } else if (position === 'left') {
          tooltipX = x - 150 - offsetX; // Предполагаем ширину тултипа ~150
          tooltipY = y + height / 2 + offsetY;
        } else if (position === 'right') {
          tooltipX = x + width + offsetX;
          tooltipY = y + height / 2 + offsetY;
        }

        // Корректировка, чтобы тултип не выходил за экран
        if (tooltipX + 150 > SCREEN_WIDTH) {
          tooltipX = SCREEN_WIDTH - 160; // 150 + отступ
        }
        if (tooltipX < 10) {
          tooltipX = 10;
        }
        if (tooltipY + 100 > SCREEN_HEIGHT) {
          tooltipY = y - 100 - offsetY;
        }
        if (tooltipY < 10) {
          tooltipY = y + height + offsetY;
        }

        setTooltipPosition({ x: tooltipX, y: tooltipY, width, height });
        setVisible(true);
      });
    }
  };

  // Скрытие тултипа
  const hideTooltip = () => {
    setVisible(false);
  };

  // Локальные стили для тултипа
  const tooltipStyles = StyleSheet.create({
    tooltipContainer: {
      position: 'absolute',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      maxWidth: 200,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      left: tooltipPosition.x,
      top: tooltipPosition.y,
    },
    tooltipText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    triangle: {
      position: 'absolute',
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: theme.colors.background,
      alignSelf: 'center',
    },
  });

  return (
    <>
      <Pressable ref={triggerRef} onPress={showTooltip}>
        {children}
      </Pressable>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <Pressable style={{ flex: 1 }} onPress={hideTooltip}>
          <View style={tooltipStyles.tooltipContainer}>
            {position === 'bottom' && (
              <View style={[tooltipStyles.triangle, { top: -8, borderBottomColor: theme.colors.background }]} />
            )}
            {position === 'top' && (
              <View
                style={[
                  tooltipStyles.triangle,
                  {
                    bottom: -8,
                    borderBottomWidth: 0,
                    borderTopWidth: 8,
                    borderTopColor: theme.colors.background,
                  },
                ]}
              />
            )}
            <Text style={tooltipStyles.tooltipText}>{content}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default Tooltip;