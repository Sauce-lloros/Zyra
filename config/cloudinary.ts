export const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME;
export const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET;

export async function uploadImage(
  imageSource: string | File | Blob,
  folder: string = 'zyra'
): Promise<string> {
  const formData = new FormData();

  if (typeof imageSource === 'string') {
    const isWeb =
      imageSource.startsWith('blob:') ||
      imageSource.startsWith('data:');

    if (isWeb) {
      const res = await fetch(imageSource);
      const blob = await res.blob();
      const ext = blob.type?.split('/')[1] || 'jpeg';
      formData.append('file', blob, `upload.${ext}`);
    } else {
      const filename = imageSource.split('/').pop() || 'upload.jpeg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('file', { uri: imageSource, name: filename, type } as any);
    }
  } else {
    const file = imageSource as File;
    const ext = file.type?.split('/')[1] || 'jpeg';
    formData.append('file', imageSource, file.name || `upload.${ext}`);
  }

  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Error al subir imagen a Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}
