import fs from 'node:fs/promises';
import path from 'node:path';

async function deleteGalleryFile(imageUrl = '') {
  if (!imageUrl.startsWith('/uploads/')) {
    return;
  }

  const relativePath = imageUrl.replace(/^\/uploads\//, '');
  const filePath = path.resolve('uploads', relativePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Delete gallery file error:', error);
    }
  }
}

export async function deleteGalleryPhotoWithFile(photo) {
  await deleteGalleryFile(photo.imageUrl);
  await photo.deleteOne();
}
