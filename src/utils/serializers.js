export function serializeUser(user) {
  return {
    id: user._id?.toString?.() || user.id,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    email: user.email,
    role: user.role,
  };
}

export function serializeAnnouncement(announcement) {
  return {
    id: announcement._id.toString(),
    title: announcement.title,
    message: announcement.message,
    date: announcement.date,
    targetRoles: announcement.targetRoles,
    visibleToGuests: announcement.visibleToGuests,
    createdByRole: announcement.createdByRole,
    createdBy: announcement.createdBy
      ? serializeUser(announcement.createdBy)
      : null,
    createdAt: announcement.createdAt,
  };
}

export function serializeTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    firstComment: task.firstComment,
    fileName: task.fileName,
    fileUrl: task.fileUrl,
    fileMimeType: task.fileMimeType,
    createdAt: task.createdAt,
    teacher: task.teacher ? serializeUser(task.teacher) : null,
  };
}

export function serializeTaskComment(comment) {
  return {
    id: comment._id.toString(),
    text: comment.text,
    createdAt: comment.createdAt,
    author: comment.author ? serializeUser(comment.author) : null,
    task:
      comment.task && typeof comment.task === 'object'
        ? {
            id: comment.task._id?.toString?.() || comment.task.id,
            title: comment.task.title,
          }
        : comment.task?.toString?.() || comment.task,
  };
}

export function serializeChatMessage(message) {
  return {
    id: message._id.toString(),
    audience: message.audience,
    content: message.content,
    createdAt: message.createdAt,
    sender: message.sender ? serializeUser(message.sender) : null,
    recipient: message.recipient ? serializeUser(message.recipient) : null,
  };
}

export function serializeGalleryPhoto(photo) {
  return {
    id: photo._id.toString(),
    title: photo.title,
    description: photo.description,
    imageName: photo.imageName,
    imageUrl: photo.imageUrl,
    imageMimeType: photo.imageMimeType,
    createdAt: photo.createdAt,
    createdBy: photo.createdBy ? serializeUser(photo.createdBy) : null,
  };
}
