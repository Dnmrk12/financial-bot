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
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateFinancialAdvice } from '../services/GeminiApi';

const ChatBot = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('tagalog');
  const [recentConvos, setRecentConvos] = useState([]);
  const [currentConvo, setCurrentConvo] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [newConvo, setNewConvo] = useState(true);
  const [adviceType, setAdviceType] = useState('savings');
  const money = 100000;

  useEffect(() => {
    const fetchData = async () => {
      await fetchInitialSuggestions();
      await loadConvosFromStorage();
    };
    fetchData();

    return () => {
      saveCurrentConvo();
    };
  }, [language, adviceType]);

  const fetchInitialSuggestions = async () => {
    setLoading(true);
    const prompt =
      language === 'english'
        ? `I am a Filipino with ₱${money} capital. Suggest 3 realistic ${adviceType === 'business' ? 'business ideas' : 'saving strategies'} specific to the Philippines. Include the type of ${adviceType}, a creative or practical name, and a brief explanation for each. Respond in English.`
        : `Isa akong Pilipino na may ₱${money} na puhunan. Magmungkahi ng 3 makatuwirang ${adviceType === 'business' ? 'ideya ng negosyo' : 'estratehiya sa pag-iipon'} na angkop sa Pilipinas. Isama ang uri ng ${adviceType}, isang malikhaing o praktikal na pangalan, at maikling paliwanag para sa bawat isa. Sagutin sa Tagalog.`;

    const response = await generateFinancialAdvice(prompt);
    const initialMessage = [{ role: 'bot', text: response }];
    setMessages(initialMessage);
    setCurrentConvo(initialMessage);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput;
    setLoading(true);

    const prompt =
      language === 'english'
        ? `${userMessage} (Please respond in English and focus on ${adviceType} related to the Philippines.)`
        : `${userMessage} (Sagutin sa Tagalog at tumuon sa ${adviceType} sa Pilipinas.)`;

    const response = await generateFinancialAdvice(prompt);

    const newMessages = [
      ...messages,
      { role: 'user', text: userMessage },
      { role: 'bot', text: response },
    ];

    setMessages(newMessages);
    setCurrentConvo(newMessages);
    setUserInput('');
    setLoading(false);
  };

  const saveCurrentConvo = async () => {
    if (currentConvo.length === 0) return;

    const newConvoData = {
      id: Date.now(),
      messages: currentConvo,
      preview: currentConvo[currentConvo.length - 2]?.text || 'New conversation',
    };

    const updatedConvos = [newConvoData, ...recentConvos];
    setRecentConvos(updatedConvos);
    await AsyncStorage.setItem('recentConvos', JSON.stringify(updatedConvos));
  };

  const handleStartNewConversation = async () => {
    await saveCurrentConvo();
    setMessages([]);
    setCurrentConvo([]);
    setUserInput('');
    setNewConvo(true);
  };

  const loadConvosFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem('recentConvos');
      if (stored) setRecentConvos(JSON.parse(stored));
    } catch (error) {
      console.error('Failed to load recent convos', error);
    }
  };

  const handleDeleteConvo = (id) => {
    Alert.alert('Delete', 'Delete this conversation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const updated = recentConvos.filter((c) => c.id !== id);
          setRecentConvos(updated);
          await AsyncStorage.setItem('recentConvos', JSON.stringify(updated));
        },
      },
    ]);
  };

  const renderLanguageToggle = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[styles.languageButton, language === 'tagalog' && styles.languageSelected]}
        onPress={() => setLanguage('tagalog')}
      >
        <Text style={styles.languageText}>🇵🇭 Tagalog</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.languageButton, language === 'english' && styles.languageSelected]}
        onPress={() => setLanguage('english')}
      >
        <Text style={styles.languageText}>🇺🇸 English</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAdviceTypeToggle = () => (
    <View style={styles.languageContainer}>
      <TouchableOpacity
        style={[styles.languageButton, adviceType === 'savings' && styles.languageSelected]}
        onPress={() => setAdviceType('savings')}
      >
        <Text style={styles.languageText}>💰 Savings & Investing</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.languageButton, adviceType === 'business' && styles.languageSelected]}
        onPress={() => setAdviceType('business')}
      >
        <Text style={styles.languageText}>🏪 Business</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1, flexDirection: 'row' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {sidebarVisible && (
          <View style={styles.sidebar}>
            <Button title="+ New Conversation" onPress={handleStartNewConversation} />
            <Text style={styles.recentChatsHeading}>Recent Convos</Text>
            <ScrollView>
              {recentConvos.map((convo) => (
                <View key={convo.id} style={styles.recentChatItem}>
                  <TouchableOpacity onPress={() => { setMessages(convo.messages); setSidebarVisible(false); }}>
                    <Text style={styles.recentChatText}>
                      {convo.preview.length > 50 ? convo.preview.slice(0, 50) + '...' : convo.preview}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteConvo(convo.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSidebarVisible(!sidebarVisible)} style={styles.toggleSidebar}>
            <Text style={styles.toggleSidebarText}>{sidebarVisible ? 'Hide Sidebar' : 'Show Sidebar'}</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
            <Text style={styles.heading}>💸 Financial Advisor Bot</Text>
            {renderLanguageToggle()}
            {renderAdviceTypeToggle()}

            {messages.map((msg, index) => (
              <View key={index} style={[styles.messageBox, msg.role === 'user' ? styles.userMessage : styles.botMessage]}>
                <Text style={styles.messageLabel}>{msg.role === 'user' ? 'You:' : 'AI:'}</Text>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            ))}

            {loading && <ActivityIndicator size="large" color="blue" style={{ marginVertical: 20 }} />}

            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              editable={!loading}
              placeholder={language === 'english' ? 'Ask something about money or business...' : 'Magtanong tungkol sa pera o negosyo...'}
            />
            <Button title="Send" onPress={handleSend} disabled={loading} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 40,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
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
  messageBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  userMessage: {
    borderColor: '#4CAF50',
    backgroundColor: '#e6f9ec',
  },
  botMessage: {
    borderColor: '#2196F3',
    backgroundColor: '#e8f0fe',
  },
  messageLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  sidebar: {
    width: 250,
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  recentChatsHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  recentChatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  recentChatText: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleSidebar: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#007bff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleSidebarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatBot;
