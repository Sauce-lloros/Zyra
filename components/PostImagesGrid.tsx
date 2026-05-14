import { useState } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import PostImage from './PostImage';

const isWeb = Platform.OS === 'web';

interface PostImagesGridProps {
  images: string[];
}

export default function PostImagesGrid({ images }: PostImagesGridProps) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return <PostImage uri={images[0]} />;
  }

  if (images.length === 2) {
    return (
      <ResponsiveGrid aspectRatio={16 / 9}>
        <View style={styles.row}>
          <GridImage uri={images[0]} />
          <GridImage uri={images[1]} />
        </View>
      </ResponsiveGrid>
    );
  }

  if (images.length === 3) {
    return (
      <ResponsiveGrid aspectRatio={1}>
        <View style={styles.row}>
          <GridImage uri={images[0]} />
          <View style={styles.column}>
            <GridImage uri={images[1]} />
            <GridImage uri={images[2]} />
          </View>
        </View>
      </ResponsiveGrid>
    );
  }

  return (
    <ResponsiveGrid aspectRatio={1}>
      <View style={styles.row}>
        <GridImage uri={images[0]} />
        <GridImage uri={images[1]} />
      </View>
      <View style={styles.row}>
        <GridImage uri={images[2]} />
        <GridImage uri={images[3]} />
      </View>
    </ResponsiveGrid>
  );
}

function ResponsiveGrid({ aspectRatio, children }: { aspectRatio: number; children: any }) {
  const [width, setWidth] = useState(0);
  const height = width / aspectRatio;

  return (
    <View
      style={[
        styles.gridContainer,
        isWeb && { maxWidth: 800, alignSelf: 'center' },
        height > 0 && { height },
      ]}
      onLayout={e => setWidth(e.nativeEvent.layout.width)}
    >
      {height > 0 && children}
    </View>
  );
}

function GridImage({ uri }: { uri: string }) {
  if (isWeb) {
    return (
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#1a1a1a',
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <img
          src={uri}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a1a', overflow: 'hidden' }}>
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    gap: 2,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
  },
  column: {
    flex: 1,
    gap: 2,
  },
});