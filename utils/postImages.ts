import { Post } from '../types';

export function getPostImages(post: Post): string[] {
  if (post.imageURLs && post.imageURLs.length > 0) {
    return post.imageURLs;
  }
  if (post.imageURL && post.imageURL.length > 0) {
    return [post.imageURL];
  }
  return [];
}
