import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import styles from '../constants/globalStyles';

const ErrorMessage = ({ error, navigation, onRetry }) => {
  const { theme } = useTheme();

  return (
    <View style={{ alignItems: 'center', padding: 16 }}>
      <Text style={[styles.common.errorText, { color: theme.colors.error }]}>
        {error.message}
      </Text>
      {error.action && (
        <TouchableOpacity
          style={[
            styles.common.button,
            { backgroundColor: theme.colors.primary, marginTop: 8 },
          ]}
          onPress={() => navigation.navigate(error.action.navigateTo, { fetchStocks })}
        >
          <Text style={styles.common.buttonText}>{error.action.message}</Text>
        </TouchableOpacity>
      )}
      {onRetry && (
        <TouchableOpacity
          style={[
            styles.common.button,
            { backgroundColor: theme.colors.primary, marginTop: 8 },
          ]}
          onPress={onRetry}
        >
          <Text style={styles.common.buttonText}>Повторить</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ErrorMessage;