import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { generateFinancialAdvice } from '../services/GeminiApi';

const ChatBot = () => {
  const [userInput, setUserInput] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('tagalog'); // default is Tagalog
  const money = 100000;

  useEffect(() => {
    fetchInitialSuggestions();
  }, [language]);

  const fetchInitialSuggestions = async () => {
    setLoading(true);
    const getInitialPrompt = () => {
      const englishPrompt = `I am a Filipino with ₱${money} capital. Suggest 3 realistic business ideas or saving strategies specific to the Philippines. Include the type of business, a creative or practical business name, and a brief explanation for each. Respond in English.`;
      const tagalogPrompt = `Isa akong Pilipino na may ₱${money} na puhunan. Magmungkahi ng 3 makatuwirang ideya ng negosyo o estratehiya sa pag-iipon na angkop sa Pilipinas. Isama ang uri ng negosyo, isang malikhaing o praktikal na pangalan ng negosyo, at maikling paliwanag para sa bawat isa. Sagutin sa Tagalog.`;
    
      return language === 'english' ? englishPrompt : tagalogPrompt;
    };
    
    const response = await generateFinancialAdvice(getInitialPrompt());

    setBotResponse(response);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setLoading(true);

    const prompt =
      language === 'english'
        ? `${userInput} (Only respond in English and focus only on legal money, business, or financial help in the Philippines.)`
        : `${userInput} (Sagutin sa Tagalog at sagutin lamang ang tungkol sa legal na pera, negosyo, o pinansyal na tulong sa Pilipinas.)`;

    const response = await generateFinancialAdvice(prompt);
    setBotResponse(response);
    setLoading(false);
  };

  const renderLanguageToggle = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'tagalog' && styles.languageSelected,
        ]}
        onPress={() => setLanguage('tagalog')}
        disabled={loading}
      >
        <Text style={styles.languageText}>🇵🇭 Tagalog</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'english' && styles.languageSelected,
        ]}
        onPress={() => setLanguage('english')}
        disabled={loading}
      >
        <Text style={styles.languageText}>🇺🇸 English</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>💸 TIGATULONG SA PERA MO SEBING BA</Text>

        {renderLanguageToggle()}

        {loading ? (
          <ActivityIndicator size="large" color="blue" style={{ marginVertical: 20 }} />
        ) : (
          <Text style={styles.response}>{botResponse}</Text>
        )}

        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder={
            language === 'english'
              ? 'Ask something about money or business...'
              : 'Magtanong tungkol sa pera o negosyo...'
          }
          editable={!loading}
        />
        <Button title="Send" onPress={handleSend} disabled={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'flex-end' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 8,
    borderRadius: 5,
  },
  response: { marginTop: 20, fontSize: 16 },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 20,
  },
  languageButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  languageSelected: {
    backgroundColor: '#2196F3',
  },
  languageText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatBot;
