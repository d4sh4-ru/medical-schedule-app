import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { createGlobalStyles } from '../constants/globalStyles';
import HomeIcon from '../../assets/images/home_icon.svg';
import StockIcon from '../../assets/images/stock_icon.svg';
import AnalyticsIcon from '../../assets/images/analytics_icon.svg';
import ScheduleIcon from '../../assets/images/schedule_icon.svg';

/**
* Компонент навигационной панели.
* @returns {JSX.Element} JSX-элемент навигационной панели.
*/
export default function NavBar() {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme.colors);
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { name: 'Home', label: 'Главная', icon: HomeIcon },
    { name: 'Schedule', label: 'Расписание', icon: ScheduleIcon },
    { name: 'Stock', label: 'Запасы', icon: StockIcon },
    { name: 'Analytics', label: 'Аналитика', icon: AnalyticsIcon },
  ];

  return (
    <View style={styles.navBar}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[styles.navItem, route.name === item.name && styles.navItemActive]}
          onPress={() => navigation.navigate(item.name)}
        >
          <item.icon width={24} height={24} fill={theme.colors.text} />
          <Text style={[styles.navText, route.name === item.name && styles.navTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}