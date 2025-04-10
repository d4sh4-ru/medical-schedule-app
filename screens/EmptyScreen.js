import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function EmptyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/empty.png')} // Путь к картинке
        style={styles.image}
        resizeMode="contain" // Картинка масштабируется, сохраняя пропорции
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Белый фон, как на других экранах
  },
  image: {
    width: '80%', // Картинка занимает 80% ширины экрана
    height: '50%', // Высота подстраивается под пропорции
  },
});