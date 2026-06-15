import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import BottomNavBar from '@/components/BottomNavBar';
import {
  getChatbotResponse,
  type ChatMessage,
} from '@/lib/chatbot.functions';

const SUGGESTIONS = [
  { label: '🕌 Taj Mahal Info', query: 'Tell me about the history and architecture of Taj Mahal.' },
  { label: '🏖️ 3-Day Goa Plan', query: 'Give me a quick 3-day itinerary for North Goa.' },
  { label: '🎒 Travel Safety', query: 'What are key safety tips for solo travel in India?' },
  { label: '🍛 Street Food Safety', query: 'How can I eat street food safely on trips?' }
];

// Web-specific styling to avoid native StyleSheet compile errors
const webStyles = {
  webApiKeyInput: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #EFE7DC',
    backgroundColor: '#FDF6EE',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    boxSizing: 'border-box' as const,
    outline: 'none',
  }
};

export default function ChatbotScreen() {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const isWide = SCREEN_WIDTH > 768;

  const scrollViewRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Namaste! I am Wanderer AI, your personal travel guide companion. Ask me anything about itineraries, safety, foods, or destinations in India!' }
  ]);
  const [inputText, setInputText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings & Keys
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Text-To-Speech Speaking state
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);

  // Load API key from local storage
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('WANDER_INDIA_GEMINI_KEY') || '';
      setApiKey(stored);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem('WANDER_INDIA_GEMINI_KEY', key);
    }
    setShowSettings(false);
  };

  // Trigger browser speech voices cache loading
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      // Stop speaking on unmount
      stopSpeaking();
    };
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, busy]);

  const stopSpeaking = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } else {
      Speech.stop();
    }
    setSpeakingMsgIndex(null);
  };

  // Find a female voice available on the host system
  const findFemaleVoice = async (): Promise<any> => {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          // Common English female voice names/keywords
          const femaleKeywords = ['female', 'samantha', 'zira', 'karen', 'tessa', 'moira', 'google us english', 'hazel', 'victoria'];
          const match = voices.find(v => 
            v.lang.startsWith('en') && 
            femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
          );
          return match || voices.find(v => v.lang.startsWith('en')) || null;
        }
      } else {
        const voices = await Speech.getAvailableVoicesAsync();
        const femaleKeywords = ['female', 'samantha', 'zira', 'karen', 'tessa', 'moira', 'victoria', 'hazel', 'en-us-x-sfg', 'en-us-x-tpf'];
        const match = voices.find(v => 
          v.language.startsWith('en') && 
          (
            (v.name && femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))) ||
            (v.quality && v.quality.toString().includes('female'))
          )
        );
        return match || voices.find(v => v.language.startsWith('en')) || null;
      }
    } catch (e) {
      console.warn('Speech engine voice fetch failed:', e);
    }
    return null;
  };

  // Toggle or start speaking response bubble
  const handleToggleSpeak = async (text: string, index: number) => {
    // 1. If currently speaking this index, stop it
    if (speakingMsgIndex === index) {
      stopSpeaking();
      return;
    }

    // 2. Stop any other active speaker
    stopSpeaking();
    setSpeakingMsgIndex(index);

    // Clean text of markdown characters before reading aloud
    const cleanedText = text
      .replace(/[#*`_~]/g, '')
      .replace(/•/g, ', ')
      .trim();

    try {
      const voiceObj = await findFemaleVoice();

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(cleanedText);
          if (voiceObj) utterance.voice = voiceObj;
          utterance.onend = () => setSpeakingMsgIndex(null);
          utterance.onerror = () => setSpeakingMsgIndex(null);
          window.speechSynthesis.speak(utterance);
        }
      } else {
        Speech.speak(cleanedText, {
          voice: voiceObj?.identifier,
          onDone: () => setSpeakingMsgIndex(null),
          onStopped: () => setSpeakingMsgIndex(null),
          onError: () => setSpeakingMsgIndex(null)
        });
      }
    } catch (err) {
      console.error('Speech synthesis playback error:', err);
      setSpeakingMsgIndex(null);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    stopSpeaking(); // stop any audio readouts

    const newMsgs: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInputText('');
    setBusy(true);

    try {
      const activeKey = apiKey || undefined;
      const response = await getChatbotResponse({ messages: newMsgs, apiKey: activeKey });
      
      setMessages([...newMsgs, { role: 'assistant', content: response }]);
      setBusy(false);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve chatbot response.');
      setBusy(false);
    }
  };

  const clearChat = () => {
    stopSpeaking();
    setMessages([
      { role: 'assistant', content: 'Namaste! I am Wanderer AI, your personal travel guide companion. Ask me anything about itineraries, safety, foods, or destinations in India!' }
    ]);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EE" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <View style={styles.badgeRow}>
            <View style={styles.outlineBadge}>
              <Feather name="compass" size={11} color="#D4654A" style={{ marginRight: 5 }} />
              <Text style={styles.badgeText}>Travel Companion</Text>
            </View>
          </View>
          <Text style={styles.heading}>Wanderer AI Guide</Text>
        </View>

        <View style={styles.headerBtns}>
          <Pressable style={styles.clearBtn} onPress={clearChat}>
            <Feather name="trash-2" size={16} color="#8A7E74" />
          </Pressable>
          <Pressable 
            style={[styles.settingsToggle, showSettings && styles.settingsToggleActive]} 
            onPress={() => setShowSettings(!showSettings)}
          >
            <Feather name="settings" size={18} color={showSettings ? '#FFFFFF' : '#D4654A'} />
          </Pressable>
        </View>
      </View>

      {/* API Key settings panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Travel AI Credentials</Text>
          <Text style={styles.settingsSub}>
            Paste your Google Gemini API Key. This runs custom travel responses directly in your browser.
          </Text>
          <View style={styles.apiKeyRow}>
            {Platform.OS === 'web' ? (
              <input
                type="password"
                placeholder="AIzaSy... (Gemini API Key)"
                style={webStyles.webApiKeyInput}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            ) : null}
            <Pressable style={styles.saveKeyBtn} onPress={() => handleSaveApiKey(apiKey)}>
              <Text style={styles.saveKeyBtnText}>Save</Text>
            </Pressable>
          </View>
          <Text style={styles.settingsTip}>
            Shares credentials with the Monument Scanner and Food Scanner screens.
          </Text>
        </View>
      )}

      {/* CHAT SCROLLVIEW */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isSpeaking = speakingMsgIndex === i;

          return (
            <View
              key={i}
              style={[
                styles.bubbleWrapper,
                isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperBot
              ]}
            >
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
                  {msg.content}
                </Text>

                {/* Speak button for assistant bubbles */}
                {!isUser && (
                  <View style={styles.bubbleActionRow}>
                    <Pressable 
                      style={[styles.speakBtn, isSpeaking && styles.speakBtnActive]} 
                      onPress={() => handleToggleSpeak(msg.content, i)}
                    >
                      <Feather 
                        name={isSpeaking ? "volume-2" : "volume-x"} 
                        size={13} 
                        color={isSpeaking ? "#FFFFFF" : "#8A7E74"} 
                        style={{ marginRight: 4 }} 
                      />
                      <Text style={[styles.speakBtnText, isSpeaking && styles.speakBtnTextActive]}>
                        {isSpeaking ? 'Speaking...' : 'Listen'}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {busy && (
          <View style={[styles.bubbleWrapper, styles.bubbleWrapperBot]}>
            <View style={[styles.bubble, styles.bubbleBot, styles.bubbleBusy]}>
              <ActivityIndicator size="small" color="#D4654A" style={{ marginRight: 8 }} />
              <Text style={styles.busyText}>Wanderer AI is typing…</Text>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={14} color="#D4654A" style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* CHAT BOTTOM CONTROLS */}
      <View style={styles.bottomBarContainer}>
        {/* Suggestion Chips */}
        {messages.length === 1 && !busy && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsScroll}
            contentContainerStyle={styles.suggestionsContent}
          >
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s.label}
                style={styles.suggestionChip}
                onPress={() => handleSendMessage(s.query)}
              >
                <Text style={styles.suggestionText}>{s.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Text Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Ask anything about travel in India..."
            placeholderTextColor="#B8AFA8"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage(inputText)}
            editable={!busy}
          />
          <Pressable 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || busy}
          >
            <Feather name="send" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6EE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.05)',
    backgroundColor: '#FDF6EE',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  outlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4654A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(212, 101, 74, 0.04)',
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9.5,
    color: '#D4654A',
    letterSpacing: 0.5,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: '#2C2420',
  },
  headerBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  clearBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFE7DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsToggleActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  settingsPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
  },
  settingsTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#2C2420',
    marginBottom: 4,
  },
  settingsSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: '#8A7E74',
    lineHeight: 15,
    marginBottom: 12,
  },
  apiKeyRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  saveKeyBtn: {
    backgroundColor: '#D4654A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveKeyBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  settingsTip: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: '#8A7E74',
    marginTop: 8,
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  bubbleWrapperUser: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '85%',
  },
  bubbleUser: {
    backgroundColor: '#D4654A',
    borderTopRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F5E6D3',
    borderTopLeftRadius: 4,
  },
  bubbleBusy: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13.5,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#FFFFFF',
  },
  bubbleTextBot: {
    color: '#2C2420',
  },
  bubbleActionRow: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#FDF6EE',
    paddingTop: 8,
  },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF6EE',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  speakBtnActive: {
    backgroundColor: '#D4654A',
    borderColor: '#D4654A',
  },
  speakBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10.5,
    color: '#8A7E74',
  },
  speakBtnTextActive: {
    color: '#FFFFFF',
  },
  busyText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12.5,
    color: '#8A7E74',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF2F0',
    borderWidth: 1,
    borderColor: '#FFD1C9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#D4654A',
  },
  bottomBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 110, // clear navbar overlays
    paddingTop: 10,
    backgroundColor: '#FDF6EE',
    borderTopWidth: 1,
    borderColor: 'rgba(44, 36, 32, 0.03)',
  },
  suggestionsScroll: {
    marginBottom: 10,
  },
  suggestionsContent: {
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  suggestionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11.5,
    color: '#2C2420',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DC',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#2C2420',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D4654A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#B8AFA8',
    opacity: 0.5,
  }
});
