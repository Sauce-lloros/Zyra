import * as ImagePicker from 'expo-image-picker';
import { useRef } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';

const isWeb = Platform.OS === 'web';

interface ImagePickerButtonProps {
  onPick: (image: any) => void;
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  disabled?: boolean;
  children: React.ReactNode;
  style?: any;
}

export default function ImagePickerButton({
  onPick,
  allowsEditing = false,
  aspect,
  quality = 0.7,
  disabled = false,
  children,
  style,
}: ImagePickerButtonProps) {
  const fileInputRef = useRef<any>(null);

  const handleWebClick = () => {
    fileInputRef.current?.click();
  };

  const handleWebFileChange = (e: any) => {
    const file: File = e.target.files?.[0];
    if (file) onPick(file);
    e.target.value = ''; 
  };

  const handleMobilePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      aspect,
      quality,
    });

    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  const handlePress = isWeb ? handleWebClick : handleMobilePick;

  return (
    <View>
      {/* Input file invisible solo en web */}
      {isWeb && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      )}
      <TouchableOpacity onPress={handlePress} disabled={disabled} style={style}>
        {children}
      </TouchableOpacity>
    </View>
  );
}
