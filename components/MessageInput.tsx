import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatService } from '../services/ChatService';

interface MessageInputProps {
  chatId: string;
}

export default function MessageInput({ chatId }: MessageInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await chatService.sendMessage(chatId, trimmed);
      setText('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        editable={!sending}
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || sending}
        activeOpacity={0.7}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Ionicons name="send" size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: '#fff',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#208c8c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#1a4f4f',
    opacity: 0.5,
  },
});