import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './utils/ThemeProvider';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/auth/RegisterScreen';
import LoginScreen from './screens/auth/LoginScreen';
import MainScreen from './screens/MainScreen';
import ScheduleScreen from './screens/schedule/ScheduleScreen';
import NewScheduleScreen from './screens/schedule/NewScheduleScreen';
import OneScheduleScreen from './screens/schedule/OneScheduleScreen';
import EditScheduleScreen from './screens/schedule/EditScheduleScreen';
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
    config: {
      duration: 200, // Быстрый переход, как в Telegram
    },
  },
  close: {
    animation: 'timing',
    config: {
      duration: 200,
    },
  },
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            cardStyleInterpolator: forFade,
            transitionSpec: transitionSpec,
            gestureEnabled: false, // Отключаем жесты для чистого fade
            cardStyle: { backgroundColor: 'transparent' }, // Прозрачный фон
            headerStyle: {
              backgroundColor: '#00BCD4', // Циановый фон заголовка
            },
            headerTintColor: '#FFFFFF', // Белый цвет текста и иконок
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Вход' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Регистрация' }}
          />
          <Stack.Screen
            name="EmptyScreen"
            component={EmptyScreen}
            options={{ title: 'Ошибка' }}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{
              title: 'Главная',
              headerLeft: () => null, // Скрываем кнопку "Назад"
            }}
          />
          <Stack.Screen
            name="Schedule"
            component={ScheduleScreen}
            options={{
              title: 'Расписание',
              headerLeft: () => null, // Скрываем кнопку "Назад"
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Настройки',
              headerLeft: () => null, // Скрываем кнопку "Назад"
            }}
          />
          <Stack.Screen
            name="Stock"
            component={EmptyScreen}
            options={{
              title: 'Запасы',
              headerLeft: () => null, // Скрываем кнопку "Назад"
            }}
          />
          <Stack.Screen
            name="Analytics"
            component={EmptyScreen}
            options={{
              title: 'Аналитика',
              headerLeft: () => null, // Скрываем кнопку "Назад"
            }}
          />
          <Stack.Screen
            name="NewSchedule"
            component={NewScheduleScreen}
            options={{ title: 'Добавить приём' }}
          />
          <Stack.Screen
            name="OneSchedule"
            component={OneScheduleScreen}
            options={{ title: 'Подробности приёма' }}
          />
          <Stack.Screen
            name="EditSchedule"
            component={EditScheduleScreen}
            options={{ title: 'Редактировать приём' }}
          />
          <Stack.Screen
            name="UpdatePassword"
            component={UpdatePasswordScreen}
            options={{ title: 'Обновление пароля' }}
          />
          <Stack.Screen
            name="EditMe"
            component={EditMeScreen}
            options={{ title: 'Редактирование профиля' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}