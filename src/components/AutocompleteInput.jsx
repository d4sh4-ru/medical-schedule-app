import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  TextInput,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  LayoutAnimation,
} from 'react-native';
import { debounce } from '../utils/debounce';
import styles from '../constants/globalStyles';

const AutocompleteInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  fetchData,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [inputLayout, setInputLayout] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const textInputRef = useRef(null);

  const handleInputLayout = (event) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    setInputLayout({ width, height, x, y });
  };

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [suggestions, isFetchingSuggestions]);

  const fetchSuggestions = useCallback(
    debounce(async (prefix) => {
      console.log('[Autocomplete] Debounced fetchSuggestions called with prefix:', prefix);

      if (!prefix.trim()) {
        console.log('[Autocomplete] Empty prefix — clearing suggestions');
        setSuggestions([]);
        return;
      }

      try {
        setIsFetchingSuggestions(true);
        const result = await fetchData(prefix);
        console.log('[Autocomplete] Raw fetched result:', result);

        // Универсальная обработка формата
        let extracted = [];

        if (Array.isArray(result)) {
          extracted = result;
        } else if (result && Array.isArray(result.names)) {
          extracted = result.names;
        } else {
          console.warn('[Autocomplete] Unexpected suggestion format:', result);
        }

        setSuggestions(extracted);
      } catch (err) {
        console.warn('[Autocomplete] Error fetching suggestions:', err);
        setSuggestions([]);
      } finally {
        setIsFetchingSuggestions(false);
      }
    }, 300),
    [fetchData]
  );

  const handleTextChange = (text) => {
    console.log('[Autocomplete] handleTextChange:', text);
    onChangeText(text);
    fetchSuggestions(text);
  };

  const handleSelectSuggestion = (selectedName) => {
    onChangeText(selectedName);
    setSuggestions([]);
    textInputRef.current?.focus();
  };

  return (
    <View style={styles.autocompleteInput.container}>
      <TextInput
        ref={textInputRef}
        style={[
          styles.autocompleteInput.input,
          suggestions.length > 0 && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
          style
          ]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={handleTextChange}
        onLayout={handleInputLayout}
      />
      {isFetchingSuggestions && (
        <View
          style={[
            styles.autocompleteInput.loadingContainer,
            {
              top: inputLayout.height,
              width: inputLayout.width,
            },
          ]}
        >
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
      {suggestions.length > 0 && !isFetchingSuggestions && (
        <ScrollView
          style={[
            styles.autocompleteInput.suggestionContainer,
            {
              borderBottomWidth: 0,
              top: inputLayout.height - 1,
              width: inputLayout.width,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.autocompleteInput.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={styles.autocompleteInput.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AutocompleteInput;