import { StyleSheet, Text, View } from 'react-native';
import { Message } from '../types';
import { timeAgo } from '../utils/timeAgo';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
}

export default function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <View style={[styles.container, isMine ? styles.containerMine : styles.containerOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>
          {message.text}
        </Text>
      </View>
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
  textMine: {
    color: '#fff',
  },
  textOther: {
    color: '#eee',
  },
  time: {
    color: '#555',
    fontSize: 11,
    marginTop: 3,
    paddingHorizontal: 4,
  },
});
