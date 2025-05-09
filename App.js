import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './utils/ThemeProvider';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/auth/RegisterScreen';
import LoginScreen from './screens/auth/LoginScreen';
import MainScreen from './screens/MainScreen';
import ScheduleScreen from './screens/schedule/ScheduleScreen';
import ScheduleFormScreen from './screens/schedule/ScheduleFormScreen';
import StockScreen from './screens/stock/StockScreen';
import StockFormScreen from './screens/stock/StockFormScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import AnalitycsScreen from './screens/analitycs/AnalitycsScreen';
import UpdatePasswordScreen from './screens/settings/UpdatePasswordScreen';
import EditMeScreen from './screens/settings/EditMeScreen';
import ProtectedRoute from './utils/ProtectedRoute';
import { MedicationProvider } from './utils/MedicationContext';

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

// Публичные маршруты
const publicRoutes = [
  {
    name: 'Login',
    component: LoginScreen,
    options: { title: 'Вход', headerLeft: () => null },
  },
  {
    name: 'Register',
    component: RegisterScreen,
    options: { title: 'Регистрация', headerLeft: () => null },
  },
];

// Защищённые маршруты
const protectedRoutes = [
  {
    name: 'Main',
    component: MainScreen,
    options: { title: 'Главная', headerLeft: () => null },
  },
  {
    name: 'Schedule',
    component: ScheduleScreen,
    options: { title: 'Расписание', headerLeft: () => null },
  },
  {
    name: 'Settings',
    component: SettingsScreen,
    options: { title: 'Настройки', headerLeft: () => null },
  },
  {
    name: 'Stock',
    component: StockScreen,
    options: { title: 'Запасы', headerLeft: () => null },
  },
  {
    name: 'Analytics',
    component: AnalitycsScreen,
    options: { title: 'Аналитика', headerLeft: () => null },
  },
  {
    name: 'ScheduleForm',
    component: ScheduleFormScreen,
    options: { title: 'Приём' },
  },
  {
    name: 'StockForm',
    component: StockFormScreen,
    options: { title: 'Добавить запас' },
  },
  {
    name: 'UpdatePassword',
    component: UpdatePasswordScreen,
    options: { title: 'Обновление пароля' },
  },
  {
    name: 'EditMe',
    component: EditMeScreen,
    options: { title: 'Редактирование профиля' },
  },
];

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MedicationProvider navigation={navigationRef}>
          <Stack.Navigator
            initialRouteName='Main'
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
            {publicRoutes.map((route) => (
              <Stack.Screen
                key={route.name}
                name={route.name}
                component={route.component}
                options={route.options}
              />
            ))}
            {protectedRoutes.map((route) => (
              <Stack.Screen
                key={route.name}
                name={route.name}
                options={route.options}
              >
                {(props) => (
                  <ProtectedRoute>
                    <route.component {...props} />
                  </ProtectedRoute>
                )}
              </Stack.Screen>
            ))}
          </Stack.Navigator>
        </MedicationProvider>
      </NavigationContainer>
    </ThemeProvider>
  );
}
