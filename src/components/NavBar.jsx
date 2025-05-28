import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import styles from '../constants/globalStyles';

/**
 * Компонент навигационной панели.
 * @returns {JSX.Element} JSX-элемент навигационной панели.
 */
export default function NavBar() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { name: 'Home', label: 'Главная', icon: 'home-outline', activeIcon: 'home' },
    { name: 'Schedule', label: 'Расписание', icon: 'calendar-outline', activeIcon: 'calendar' },
    { name: 'Stock', label: 'Запасы', icon: 'cube-outline', activeIcon: 'cube' },
    { name: 'Analytics', label: 'Аналитика', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
  ];

  /**
   * Вспомогательная функция для рендеринга иконки и текста элемента навигации.
   * @param {object} item - Объект элемента навигации (name, label, icon, activeIcon).
   * @param {boolean} isActive - Флаг, указывающий, активен ли текущий элемент.
   * @returns {JSX.Element} JSX-элемент кнопки навигации.
   */
  const renderNavItem = (item, isActive) => {
    const iconName = isActive ? item.activeIcon : item.icon;
    // Определяем цвет иконки: белый для активной, иначе цвет текста из темы
    const iconColor = isActive ? 'white' : theme.colors.text;

    return (
      <TouchableOpacity
        key={item.name}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => navigation.navigate(item.name)}
      >
        <Ionicons name={iconName} size={24} color={iconColor} />
        <Text style={[styles.navText, isActive && styles.navTextActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.navBar}>
      {navItems.map((item) => {
        const isActive = route.name === item.name;
        return renderNavItem(item, isActive);
      })}
    </View>
  );
}