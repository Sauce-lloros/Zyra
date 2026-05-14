import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { authService } from '../services/AuthService';
import { followService } from '../services/FollowService';
import { confirm } from '../utils/confirm';

interface FollowButtonProps {
  targetUid: string;
  targetUsername?: string;
  size?: 'small' | 'medium' | 'large';
  onChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({
  targetUid,
  targetUsername,
  size = 'medium',
  onChange,
}: FollowButtonProps) {
  const currentUser = authService.getCurrentUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);

  const isSelf = currentUser?.uid === targetUid;

  useEffect(() => {
    if (!targetUid || isSelf) {
      setLoading(false);
      return;
    }

    const unsub = followService.subscribeToFollowState(targetUid, follows => {
      setIsFollowing(follows);
      setLoading(false);
    });

    return unsub;
  }, [targetUid, isSelf]);

  const handlePress = async () => {
    if (loading) return;

    try {
      if (isFollowing) {
        const ok = await confirm({
          title: 'Dejar de seguir',
          message: targetUsername
            ? `¿Dejar de seguir a @${targetUsername}?`
            : '¿Dejar de seguir a este usuario?',
          confirmText: 'Dejar de seguir',
          destructive: true,
        });
        if (!ok) return;

        setLoading(true);
        await followService.unfollow(targetUid);
        onChange?.(false);
      } else {
        setLoading(true);
        await followService.follow(targetUid);
        onChange?.(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo completar la acción');
    } finally {
      setLoading(false);
    }
  };

  if (isSelf || !currentUser) return null;

  const sizeStyles = {
    small: { paddingHorizontal: 14, paddingVertical: 6, fontSize: 12, minWidth: 90 },
    medium: { paddingHorizontal: 20, paddingVertical: 9, fontSize: 14, minWidth: 110 },
    large: { paddingHorizontal: 28, paddingVertical: 12, fontSize: 15, minWidth: 130 },
  }[size];

  if (loading && !isFollowing) {
    return (
      <TouchableOpacity
        style={[
          styles.btn,
          styles.btnFollow,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            minWidth: sizeStyles.minWidth,
          },
        ]}
        disabled
      >
        <ActivityIndicator size="small" color="#fff" />
      </TouchableOpacity>
    );
  }

  if (isFollowing) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={() => setHovered(true)}
        onPressOut={() => setHovered(false)}
        // @ts-ignore - props web para hover
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={[
          styles.btn,
          hovered ? styles.btnUnfollowHover : styles.btnFollowing,
          {
            paddingHorizontal: sizeStyles.paddingHorizontal,
            paddingVertical: sizeStyles.paddingVertical,
            minWidth: sizeStyles.minWidth,
          },
        ]}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons
              name={hovered ? 'person-remove-outline' : 'checkmark'}
              size={sizeStyles.fontSize + 2}
              color={hovered ? '#ff6b6b' : '#fff'}
            />
            <Text
              style={[
                styles.btnText,
                { fontSize: sizeStyles.fontSize },
                hovered && { color: '#ff6b6b' },
              ]}
            >
              {hovered ? 'Dejar de seguir' : 'Siguiendo'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.btn,
        styles.btnFollow,
        {
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
          minWidth: sizeStyles.minWidth,
        },
      ]}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="person-add-outline" size={sizeStyles.fontSize + 2} color="#fff" />
          <Text style={[styles.btnText, { fontSize: sizeStyles.fontSize }]}>Seguir</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    gap: 6,
  },
  btnFollow: {
    backgroundColor: '#208c8c',
  },
  btnFollowing: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#444',
  },
  btnUnfollowHover: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ff6b6b',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
