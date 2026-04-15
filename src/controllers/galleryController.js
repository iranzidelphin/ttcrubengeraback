import { GalleryPhoto } from '../models/GalleryPhoto.js';
import { serializeGalleryPhoto } from '../utils/serializers.js';
import { deleteGalleryPhotoWithFile } from '../utils/galleryCleanup.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';

export async function listGalleryPhotos(req, res) {
  const photos = await GalleryPhoto.find()
    .populate('createdBy', 'firstName lastName email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    photos: photos.map(serializeGalleryPhoto),
  });
}

export async function createGalleryPhoto(req, res) {
  try {
    const { title = '', description = '' } = req.body;

    if (!title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Photo title is required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'An image file is required.',
      });
    }

    const photo = await GalleryPhoto.create({
      title: title.trim(),
      description: description.trim(),
      imageName: req.file.originalname,
      imageUrl: `/uploads/gallery/${req.file.filename}`,
      imageMimeType: req.file.mimetype,
      createdBy: req.user._id,
    });

    const populatedPhoto = await GalleryPhoto.findById(photo._id).populate(
      'createdBy',
      'firstName lastName email role'
    );
    const payload = serializeGalleryPhoto(populatedPhoto);

    req.app.get('io').emit(SOCKET_EVENTS.GALLERY_PHOTO_CREATED, payload);

    res.status(201).json({
      success: true,
      photo: payload,
    });
  } catch (error) {
    console.error('Create gallery photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not upload gallery photo.',
    });
  }
}

export async function deleteGalleryPhoto(req, res) {
  try {
    const photo = await GalleryPhoto.findById(req.params.photoId);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Gallery photo not found.',
      });
    }

    await deleteGalleryPhotoWithFile(photo);

    req.app.get('io').emit(SOCKET_EVENTS.GALLERY_PHOTO_DELETED, {
      photoId: req.params.photoId,
    });

    res.status(200).json({
      success: true,
      photoId: req.params.photoId,
    });
  } catch (error) {
    console.error('Delete gallery photo error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not delete gallery photo.',
    });
  }
}
