import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { chatService } from '../services/ChatService';
import { Message } from '../types';
import { timeAgo } from '../utils/timeAgo';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  chatId: string;
}

export default function MessageBubble({ message, isMine, chatId }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar mensaje',
      '¿Eliminar este mensaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteMessage(chatId, message.id);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'No se pudo eliminar');
            }
          },
        },
      ]
    );
    setShowActions(false);
  };

  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerOther]}>
      <TouchableOpacity
        onLongPress={() => isMine && setShowActions(!showActions)}
        activeOpacity={0.8}
      >
        <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
          <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>
            {message.text}
          </Text>
        </View>
      </TouchableOpacity>

      {showActions && isMine && (
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={14} color="#ff6b6b" />
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.time}>{timeAgo(message.createdAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
    maxWidth: '80%',
  },
  containerMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  containerOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: '#208c8c',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#222',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMine: { color: '#fff' },
  textOther: { color: '#eee' },
  time: {
    color: '#555',
    fontSize: 11,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  deleteBtnText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
  },
});