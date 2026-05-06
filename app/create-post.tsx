import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import ImagePickerButton from '../components/ImagePickerButton';
import { authService } from '../services/AuthService';
import { ImageFolders, imageService } from '../services/ImageService';
import { postService } from '../services/PostService';
import { POST_CONTENT_MAX_LENGTH, validatePostContent } from '../validators/postValidators';

const MAX_IMAGES = 4;

export default function CreatePost() {
  const user = authService.getCurrentUser();
  const [content, setContent] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const handleImagePicked = async (image: any) => {
    if (imageUris.length >= MAX_IMAGES) {
      Alert.alert('Límite alcanzado', `Solo puedes subir hasta ${MAX_IMAGES} imágenes`);
      return;
    }
    setUploadingImg(true);
    try {
      const url = await imageService.upload(image, ImageFolders.POSTS);
      setImageUris(prev => [...prev, url]);
    } catch {
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    const check = validatePostContent(content);
    if (!check.valid) {
      Alert.alert('Aviso', check.error!);
      return;
    }

    setLoading(true);
    try {
      await postService.create({ content, imageURLs: imageUris });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo publicar');
    } finally {
      setLoading(false);
    }
  };

  const canAddMore = imageUris.length < MAX_IMAGES;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Ionicons name="close" size={24} color="#aaa" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nueva publicación</Text>
          <TouchableOpacity
            style={[styles.publishBtn, (!content.trim() || loading) && styles.publishBtnDisabled]}
            onPress={handlePublish}
            disabled={!content.trim() || loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.publishBtnText}>Publicar</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Editor */}
        <View style={styles.editor}>
          <Avatar fallback={user?.email} size={42} bordered={false} />
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="¿Qué estás pensando?"
              placeholderTextColor="#444"
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              maxLength={POST_CONTENT_MAX_LENGTH}
            />
            <Text style={styles.charCount}>{content.length}/{POST_CONTENT_MAX_LENGTH}</Text>
          </View>
        </View>

        {uploadingImg && (
          <View style={styles.imagePreviewLoading}>
            <ActivityIndicator color="#208c8c" />
            <Text style={styles.uploadingText}>Subiendo imagen...</Text>
          </View>
        )}

        {imageUris.length > 0 && (
          <View style={styles.imagesContainer}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.toolbar}>
          <ImagePickerButton onPick={handleImagePicked} disabled={uploadingImg || !canAddMore}>
            <View style={[styles.toolBtn, !canAddMore && styles.toolBtnDisabled]}>
              <Ionicons name="image-outline" size={24} color={canAddMore ? '#208c8c' : '#444'} />
              <Text style={[styles.toolBtnText, !canAddMore && styles.toolBtnTextDisabled]}>
                Imagen ({imageUris.length}/{MAX_IMAGES})
              </Text>
            </View>
          </ImagePickerButton>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  cancelBtn: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  publishBtn: {
    backgroundColor: '#208c8c',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  publishBtnDisabled: { opacity: 0.4 },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#222' },
  editor: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    minHeight: 160,
  },
  inputWrapper: { flex: 1 },
  textInput: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { color: '#444', fontSize: 12, textAlign: 'right', marginTop: 8 },
  imagePreviewLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  uploadingText: { color: '#208c8c', fontSize: 14 },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  imageWrapper: {
    width: '48%',
    aspectRatio: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#111',
    borderRadius: 12,
  },
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 24,
  },
  toolBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolBtnDisabled: { opacity: 0.5 },
  toolBtnText: { color: '#208c8c', fontSize: 14, fontWeight: '600' },
  toolBtnTextDisabled: { color: '#444' },
});