import { Image, StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  photoURL?: string | null;
  fallback?: string | null;
  size?: number;
  bordered?: boolean;
}

export default function Avatar({
  photoURL,
  fallback = '?',
  size = 40,
  bordered = true,
}: AvatarProps) {
  const letter = fallback?.[0]?.toUpperCase() || '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  if (photoURL) {
    return (
      <Image
        source={{ uri: photoURL }}
        style={[
          containerStyle,
          bordered && { borderWidth: size > 60 ? 2.5 : 1.5, borderColor: '#208c8c' },
        ]}
      />
    );
  }

  return (
    <View style={[styles.placeholder, containerStyle]}>
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#208c8c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: '#fff',
    fontWeight: '700',
  },
});