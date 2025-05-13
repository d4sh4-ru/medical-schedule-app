import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const dayWidth = (width - 32) / 7;

const globalStyles = StyleSheet.create({
  common: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
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
      alignItems: 'center',
      justifyContent: 'center',
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
    input: {
      borderWidth: 1,
      borderColor: '#bbbbbb',
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#000',
      backgroundColor: '#fff',
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
  stockScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    list: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 80, // Для NavBar и FAB
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      padding: 16,
      width: '100%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#000',
      marginBottom: 12,
    },
  },
  stockFormScreen: {
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingTop: 16,
      paddingHorizontal: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: '#000',
      marginBottom: 16,
    },
  },
  autocompleteInput: {
    container: {
      position: 'relative',
    },
    input: {
      borderWidth: 1,
      borderColor: '#bbbbbb',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 12,
      fontSize: 16,
      color: '#000',
      backgroundColor: '#fff',
    },
    suggestionContainer: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderWidth: 1,
      borderColor: '#bbbbbb',
      maxHeight: 200,
      zIndex: 1000,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    suggestionText: {
      fontSize: 16,
      color: '#000',
    },
    loadingContainer: {
      position: 'absolute',
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#bbbbbb',
      padding: 8,
      alignItems: 'center',
      zIndex: 1000,
    },
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemActive: {
    backgroundColor: '#007AFF',
    borderRadius: 32,
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  navTextActive: {
    color: '#eee',
    fontWeight: '600',
  },
});

export default globalStyles;