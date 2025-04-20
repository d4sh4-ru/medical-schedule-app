import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './utils/ThemeProvider';
import { MedicationProvider } from './utils/MedicationContext';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/auth/RegisterScreen';
import LoginScreen from './screens/auth/LoginScreen';
import MainScreen from './screens/MainScreen';
import ScheduleScreen from './screens/schedule/ScheduleScreen';
import ScheduleFormScreen from './screens/schedule/ScheduleFormScreen';
import StockScreen from './screens/stock/StockScreen';
import StockFormScreen from './screens/stock/StockFormScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import UpdatePasswordScreen from './screens/settings/UpdatePasswordScreen';
import EditMeScreen from './screens/settings/EditMeScreen';
import EmptyScreen from './screens/error/EmptyScreen';

const Stack = createStackNavigator();

// Кастомная анимация fade
const forFade = ({ current }) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

// Настройки перехода
const transitionSpec = {
  open: {
    animation: 'timing',
    config: { duration: 200 },
  },
  close: {
    animation: 'timing',
    config: { duration: 200 },
  },
};

export default function App() {
  return (
    <ThemeProvider>
      <MedicationProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{
              cardStyleInterpolator: forFade,
              transitionSpec: transitionSpec,
              gestureEnabled: false,
              cardStyle: { backgroundColor: 'transparent' },
              headerStyle: { backgroundColor: '#00BCD4' },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Вход' }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Регистрация' }} />
            <Stack.Screen name="EmptyScreen" component={EmptyScreen} options={{ title: 'Ошибка' }} />
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: 'Главная', headerLeft: () => null }}
            />
            <Stack.Screen
              name="Schedule"
              component={ScheduleScreen}
              options={{ title: 'Расписание', headerLeft: () => null }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Настройки', headerLeft: () => null }}
            />
            <Stack.Screen
              name="Stock"
              component={StockScreen}
              options={{ title: 'Запасы', headerLeft: () => null }}
            />
            <Stack.Screen
              name="Analytics"
              component={EmptyScreen}
              options={{ title: 'Аналитика', headerLeft: () => null }}
            />
            <Stack.Screen name="ScheduleForm" component={ScheduleFormScreen} options={{ title: 'Приём' }} />
            <Stack.Screen name="StockForm" component={StockFormScreen} options={{ title: 'Добавить запас' }} />
            <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} options={{ title: 'Обновление пароля' }} />
            <Stack.Screen name="EditMe" component={EditMeScreen} options={{ title: 'Редактирование профиля' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </MedicationProvider>
    </ThemeProvider>
  );
}