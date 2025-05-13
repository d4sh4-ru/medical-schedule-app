import { StyleSheet } from 'react-native';

export const createGlobalStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.secondary,
      paddingHorizontal: 16,
      paddingTop: 24,
      paddingBottom: 80,
    },
    card: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      elevation: 3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardOverdue: {
      borderColor: colors.error,
    },
    cardCompleted: {
      borderColor: colors.accent,
      opacity: 0.7,
    },
    settingsCard: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      elevation: 3,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 50,
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: 100,
      right: 16,
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      elevation: 5,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 24,
      fontWeight: 'bold',
    },
    cardActions: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    bodyText: {
      color: colors.text,
      fontSize: 16,
    },
    captionText: {
      color: colors.text,
      fontSize: 14,
      opacity: 0.7,
    },
    overdueText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: 'bold',
    },
    markButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    markButtonCompleted: {
      backgroundColor: colors.accent,
    },
    markButtonText: {
      color: colors.background,
      fontSize: 14,
      fontWeight: '600',
    },
    actionButton: {
      padding: 8,
      marginLeft: 8,
    },
    calendar: {
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      elevation: 3,
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontSize: 16,
    },
    picker: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
      height: 46,
      justifyContent: 'center',
    },
    switch: {
      trackColor: { false: colors.border, true: colors.accent },
      thumbColor: colors.background,
    },
    navBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 8,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
      elevation: 5,
    },
    navItem: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: 4,
    },
    navItemActive: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingVertical: 4,
    },
    navText: {
      color: colors.text,
      fontSize: 11,
      marginTop: 2,
    },
    navTextActive: {
      color: colors.background,
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      maxHeight: '50%',
    },
    modalItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    // Регистрация
    // input: {
    //   borderWidth: 1,
    //   borderColor: '#007AFF',
    //   borderRadius: 8,
    //   padding: 12,
    //   marginBottom: 5,
    //   fontSize: 16,
    //   color: '#000',
    // },
    containerCenter: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.backgroundColor,
    },
    titleCenter: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 30,
    },
    inputError: {
      borderColor: colors.error,
    },
    errorText: {
      color: colors.error,
      fontSize: 12,
      marginBottom: 10,
    },
    button: {
      backgroundColor: colors.border,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    link: {
      color: colors.primary,
      fontSize: 14,
      textAlign: 'center',
      textDecorationLine: 'underline',
      marginVertical: 5,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 15,
    },
    switchLabel: {
      fontSize: 14,
      color: '#000',
      flex: 1,
    },
    scrollContainer: {
      paddingHorizontal: 0,
      paddingVertical: 30,
      flexGrow: 1,
      justifyContent: 'center',
    },
  });

// Новые стили
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const dayWidth = (width - 32) / 7;

const globalStyles = StyleSheet.create({
  common: {
    card: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: '#eee',
    },
    cardCompleted: {
      backgroundColor: '#e6f3e6',
      borderColor: '#d0e8d0',
    },
    cardOverdue: {
      backgroundColor: '#ffe6e6',
      borderColor: '#ffd0d0',
    },
    button: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    buttonCompleted: {
      backgroundColor: '#4CAF50',
    },
    buttonOverdue: {
      backgroundColor: '#d32f2f',
    },
    buttonDisabled: {
      backgroundColor: '#B0BEC5',
      opacity: 0.7,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    text: {
      fontSize: 16,
      fontWeight: '500',
      color: '#000',
    },
    captionText: {
      fontSize: 14,
      color: '#666',
    },
    overdueText: {
      fontSize: 14,
      color: '#d32f2f',
      fontWeight: '500',
    },
    errorText: {
      fontSize: 16,
      color: '#d32f2f',
      textAlign: 'center',
      marginTop: 16,
    },
    loadingText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 16,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 16,
    },
    debugText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      marginBottom: 8,
    },
  },
  header: {
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    singleIconContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    date: {
      fontSize: 18,
      fontWeight: '600',
    },
  },
  weekCalendar: {
    container: {
      padding: 16,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    weekLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    weekDaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: width - 32,
    },
    dayContainer: {
      alignItems: 'center',
      width: (width - 32) / 7,
    },
    dayLabel: {
      fontSize: 16,
      color: '#666',
      marginBottom: 8,
    },
    selectedDayLabel: {
      fontWeight: '700',
      color: '#000',
    },
    dayNumberContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayNumber: {
      fontSize: 16,
      fontWeight: '500',
      color: '#000',
    },
    selectedDayContainer: {
      backgroundColor: '#007AFF',
    },
    selectedDay: {
      color: '#fff',
      fontWeight: '700',
    },
  },
  notificationsList: {
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    list: {
      paddingBottom: 16,
    },
  },
  calendarScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    monthContainer: {
      padding: 16,
    },
    monthLabel: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    weekdaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
      width: width - 32,
    },
    weekdayLabel: {
      fontSize: 14,
      color: '#666',
      width: dayWidth,
      minWidth: dayWidth,
      maxWidth: dayWidth,
      textAlign: 'center',
    },
    daysContainer: {
      width: width - 32,
    },
    weekContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    dayContainer: {
      width: dayWidth,
      minWidth: dayWidth,
      maxWidth: dayWidth,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayNumber: {
      fontSize: 16,
      color: '#000',
    },
    todayDayNumber: {
      fontWeight: '700',
    },
    selectedDayContainer: {
      backgroundColor: '#007AFF',
      borderRadius: 20,
    },
    selectedDayNumber: {
      color: '#fff',
      fontWeight: '700',
    },
    emptyDay: {
      width: dayWidth,
      minWidth: dayWidth,
      maxWidth: dayWidth,
      height: 40,
    },
  },
  homeScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
  },
  settingsScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    settingsContainer: {
      flex: 1,
      padding: 16,
    },
  },
  scheduleScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    calendar: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 8,
      overflow: 'hidden',
    },
    notificationsContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 10,
    },
    modalText: {
      fontSize: 16,
      color: '#000',
      marginBottom: 8,
    },
    modalButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    timeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    timeText: {
      fontSize: 16,
      color: '#000',
      marginLeft: 8,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      flexWrap: 'wrap',
    },
    dateText: {
      fontSize: 14,
      color: '#000',
      marginLeft: 8,
      flexWrap: 'wrap',
    },
  },
  scheduleListScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    listContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
  },
});

export default globalStyles;