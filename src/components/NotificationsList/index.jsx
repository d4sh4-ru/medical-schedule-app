import React from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { getTimeRemaining } from '../../utils/timeUtils';
import styles from '../../constants/globalStyles';

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
  //TODO: добавить тип с кнопкой или со статусами
}) => {
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

    console.log('Rendering notification:', item);

    // Условно выбираем компонент: TouchableOpacity, если есть onNotificationPress, иначе View
    const CardComponent = onNotificationPress ? TouchableOpacity : View;

    return (
      <CardComponent
        style={[
          styles.common.card,
          isTaken ? styles.common.cardCompleted : isOverdue && styles.common.cardOverdue,
        ]}
        onPress={onNotificationPress ? () => onNotificationPress(item) : undefined}
        activeOpacity={0.7} // Для визуального отклика при нажатии
      >
        <View>
          <Text style={styles.common.text}>{item.medicationTradeName || 'Без названия'}</Text>
          <Text style={isOverdue ? styles.common.overdueText : styles.common.captionText}>
            {isPending ? 'Ожидает подтверждения' : timeText}
          </Text>
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
    <View style={styles.notificationsList.container}>
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
            keyExtractor={(item) => `${item.id}-${item.sentAt}`}
            contentContainerStyle={styles.notificationsList.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']} //TODO: Вынести в стили
                tintColor="#007AFF"
              />
            }
          />
        </>
      )}
    </View>
  );
};

export default NotificationsList;