import { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';

const isWeb = Platform.OS === 'web';
const MAX_WEB_WIDTH = 800;

interface PostImageProps {
  uri: string;
}

export default function PostImage({ uri }: PostImageProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (isWeb) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: MAX_WEB_WIDTH,
          maxHeight: 500,
          borderRadius: 12,
          overflow: 'hidden',
          marginBottom: 10,
          marginLeft: 'auto',
          marginRight: 'auto',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={uri}
          style={{
            width: '100%',
            maxHeight: 500,
            objectFit: 'contain',
            borderRadius: 12,
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <View
      style={{ width: '100%', marginBottom: 10 }}
      onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && <MobilePostImage uri={uri} containerWidth={containerWidth} />}
    </View>
  );
}

function MobilePostImage({ uri, containerWidth }: { uri: string; containerWidth: number }) {
  const [imgHeight, setImgHeight] = useState(220);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        const ratio = h / w;
        setImgHeight(Math.min(containerWidth * ratio, 500));
      },
      () => setImgHeight(220)
    );
  }, [uri, containerWidth]);

  return (
    <Image
      source={{ uri }}
      style={{
        width: containerWidth,
        height: imgHeight,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
      }}
      resizeMode="contain"
    />
  );
}