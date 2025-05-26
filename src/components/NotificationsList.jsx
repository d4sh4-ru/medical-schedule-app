import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, Animated, Dimensions, Easing } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { getTimeRemaining, getFormattedDate } from '../utils/timeUtils';
import styles from '../constants/globalStyles';
import log from '../utils/coloredLog';

const { width } = Dimensions.get('window');

const NotificationsList = ({
  notifications,
  isLoadingNotifications,
  isRefreshing,
  notificationsError,
  selectedDate,
  onRefresh,
  onConfirmNotification,
  onNotificationPress,
  isRetrying,
  getTodayFormatted,
  onLeftSwipe,
  onRightSwipe,
  disableSwipes = false, // Новый пропс
}) => {
  const gestureStateRef = useRef({ dx: 0 });
  const translateX = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  // Функция для выполнения анимации свайпа
  const runSwipeAnimation = (direction, newDate, callback, dx) => {
    const isLeft = direction === 'left';
    const flyOutValue = isLeft ? -width : width; // Вылет за экран
    const resetValue = isLeft ? width : -width; // Противоположная сторона

    // Вычисляем оставшееся расстояние и масштабируем duration
    const distanceRemaining = Math.abs(flyOutValue - dx);
    const baseDuration = 300;
    const flyOutDuration = Math.max(50, (distanceRemaining / width) * baseDuration);

    log.cyan('[NotificationsList] Swipe animation params:', {
      direction,
      dx,
      flyOutValue,
      distanceRemaining,
      flyOutDuration,
      newDate: newDate.toISOString(),
    });

    Animated.sequence([
      // 1. Вылет влево/вправо от текущего dx
      Animated.timing(translateX, {
        toValue: flyOutValue,
        duration: flyOutDuration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 2. Мгновенный сброс за противоположную границу
      Animated.timing(translateX, {
        toValue: resetValue,
        duration: 0,
        useNativeDriver: true,
      }),
      // 3. Задержка для рендеринга новых уведомлений
      Animated.timing(translateX, {
        toValue: resetValue,
        duration: 250,
        useNativeDriver: true,
      }),
      // 4. Въезд в центр
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      log.cyan('[NotificationsList] Swipe animation completed, translateX:', translateX.__getValue());
      setIsAnimating(false);
    });

    // Вызываем callback после сброса (шаг 2) для загрузки уведомлений
    setTimeout(() => {
      log.cyan('[NotificationsList] Invoking callback for date:', newDate.toISOString());
      callback(newDate);
      log.cyan('[NotificationsList] Callback invoked, new notifications requested');
    }, 0);
  };

  // Обработка жеста свайпа
  const onGestureEvent = ({ nativeEvent }) => {
    if (disableSwipes) {
      log.warn('[NotificationsList] Swipes disabled, ignoring gesture');
      return;
    }
    if (isAnimating) {
      log.warn('[NotificationsList] Animation in progress, ignoring gesture');
      return;
    }
    gestureStateRef.current.dx = nativeEvent.translationX;
    translateX.setValue(nativeEvent.translationX);
    log.cyan('[NotificationsList] Gesture event:', { translationX: nativeEvent.translationX });
  };

  // Обработка изменения состояния жеста
  const onHandlerStateChange = ({ nativeEvent }) => {
    if (disableSwipes) {
      log.warn('[NotificationsList] Swipes disabled, ignoring handler state change');
      return;
    }
    if (nativeEvent.state === State.END && !isAnimating) {
      const { dx } = gestureStateRef.current;
      const SWIPE_THRESHOLD = 50;

      setIsAnimating(true);
      log.cyan('[NotificationsList] Swipe ended, dx:', dx);

      let newDate = new Date(selectedDate);
      if (dx > SWIPE_THRESHOLD && onRightSwipe) {
        // Свайп вправо: предыдущий день
        newDate.setDate(selectedDate.getDate() - 1);
        log.cyan('[NotificationsList] Swipe right, new date:', newDate.toISOString());
        runSwipeAnimation('right', newDate, onRightSwipe, dx);
      } else if (dx < -SWIPE_THRESHOLD && onLeftSwipe) {
        // Свайп влево: следующий день
        newDate.setDate(selectedDate.getDate() + 1);
        log.cyan('[NotificationsList] Swipe left, new date:', newDate.toISOString());
        runSwipeAnimation('left', newDate, onLeftSwipe, dx);
      } else {
        // Пружинная анимация возврата
        Animated.spring(translateX, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }).start(() => {
          setIsAnimating(false);
          log.cyan('[NotificationsList] Spring-back animation completed, translateX:', translateX.__getValue());
        });
      }

      gestureStateRef.current.dx = 0;
    }
  };

  const renderNotification = ({ item }) => {
    const isTaken = item.status === 'accepted';
    const isPending = item.id === 0;
    const timeText = isTaken
      ? new Date(item.sentAt).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
      : getTimeRemaining(item.sentAt).text;
    const isOverdue = !isTaken && getTimeRemaining(item.sentAt).overdue;

    log.cyan('[NotificationsList] Rendering notification:', item);

    const CardComponent = onNotificationPress ? TouchableOpacity : View;

    return (
      <CardComponent
        style={[
          styles.common.card,
          isTaken ? styles.common.cardCompleted : isOverdue && styles.common.cardOverdue,
        ]}
        onPress={onNotificationPress ? () => onNotificationPress(item) : undefined}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.common.text}>{item.medicationTradeName || 'Без названия'}</Text>
          <Text style={isOverdue ? styles.common.overdueText : styles.common.captionText}>
            {timeText}
          </Text>
          <Text>{getFormattedDate(item.sentAt)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.common.button,
            isTaken && styles.common.buttonCompleted,
            isPending && styles.common.buttonDisabled,
            isOverdue && !isTaken && !isPending && styles.common.buttonOverdue,
          ]}
          onPress={() => onConfirmNotification(item.id)}
          disabled={isTaken || isPending || isRetrying}
        >
          <Text style={styles.common.buttonText}>
            {isTaken ? 'Принято' : isPending ? 'Ожидает' : 'Отметить'}
          </Text>
        </TouchableOpacity>
      </CardComponent>
    );
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
      activeOffsetX={[-10, 10]}
      enabled={!disableSwipes} // Блокировка свайпов
    >
      <Animated.View
        style={[styles.notificationsList.container, { transform: [{ translateX }] }]}
      >
        {isLoadingNotifications && !isRefreshing ? (
          <Text style={styles.common.loadingText}>Загрузка уведомлений...</Text>
        ) : notificationsError ? (
          <Text style={styles.common.errorText}>{notificationsError}</Text>
        ) : notifications.length === 0 ? (
          <Text style={styles.common.emptyText}>
            Нет уведомлений на {getTodayFormatted(selectedDate)}
          </Text>
        ) : (
          <>
            <Text style={styles.common.debugText}>Уведомлений: {notifications.length}</Text>
            <FlatList
              data={notifications}
              renderItem={renderNotification}
              keyExtractor={(item) => `${item.sentAt}+${item.medicationTradeName}`}
              contentContainerStyle={styles.notificationsList.list}
              showsVerticalScrollIndicator={false}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  colors={['#007AFF']}
                  tintColor="#007AFF"
                />
              }
            />
          </>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default NotificationsList;