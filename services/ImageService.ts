import { uploadImage as cloudinaryUpload } from '../config/cloudinary';

export interface IImageService {
  upload(image: any, folder?: string): Promise<string>;
}

class CloudinaryAdapter implements IImageService {
  async upload(image: any, folder: string = 'zyra'): Promise<string> {
    return await cloudinaryUpload(image, folder);
  }
}

export const imageService: IImageService = new CloudinaryAdapter();

export const ImageFolders = {
  AVATARS: 'avatars',
  POSTS: 'posts',
} as const;
