import { Task } from '../models/Task.js';
import { TaskComment } from '../models/TaskComment.js';
import { serializeTask, serializeTaskComment } from '../utils/serializers.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import { deleteTaskWithRelations } from '../utils/taskCleanup.js';

export async function listTasks(req, res) {
  const query = req.user.role === 'teacher' ? { teacher: req.user._id } : {};
  const tasks = await Task.find(query)
    .populate('teacher', 'firstName lastName email role')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    tasks: tasks.map(serializeTask),
  });
}

export async function createTask(req, res) {
  try {
    const { title, description, firstComment = '' } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required.',
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      firstComment: firstComment.trim(),
      fileName: req.file?.originalname || '',
      fileUrl: req.file ? `/uploads/${req.file.filename}` : '',
      fileMimeType: req.file?.mimetype || '',
      teacher: req.user._id,
    });

    const populatedTask = await Task.findById(task._id).populate(
      'teacher',
      'firstName lastName email role'
    );

    if (firstComment.trim()) {
      const taskComment = await TaskComment.create({
        task: task._id,
        author: req.user._id,
        text: firstComment.trim(),
      });

      const populatedComment = await TaskComment.findById(taskComment._id).populate(
        'author',
        'firstName lastName email role'
      );

      req.app
        .get('io')
        .to('role:admin')
        .emit(SOCKET_EVENTS.COMMENT_CREATED, serializeTaskComment(populatedComment));
    }

    res.status(201).json({
      success: true,
      task: serializeTask(populatedTask),
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not create task.',
    });
  }
}

export async function listTaskComments(req, res) {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    return res.status(404).json({
      success: false,
      error: 'Task not found.',
    });
  }

  if (req.user.role === 'teacher' && task.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You cannot view comments for this task.',
    });
  }

  const comments = await TaskComment.find({ task: task._id })
    .populate('author', 'firstName lastName email role')
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    comments: comments.map(serializeTaskComment),
  });
}

export async function listAdminCommentFeed(req, res) {
  const comments = await TaskComment.find()
    .populate('author', 'firstName lastName email role')
    .populate('task', 'title')
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    comments: comments.map(serializeTaskComment),
  });
}

export async function addTaskComment(req, res) {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      'teacher',
      'firstName lastName email role'
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found.',
      });
    }

    if (!req.body.text?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment text is required.',
      });
    }

    if (req.user.role === 'teacher' && task.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot comment on this task.',
      });
    }

    if (!['student', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only students and teachers can comment on tasks.',
      });
    }

    const comment = await TaskComment.create({
      task: task._id,
      author: req.user._id,
      text: req.body.text.trim(),
    });

    const populatedComment = await TaskComment.findById(comment._id).populate(
      'author',
      'firstName lastName email role'
    );

    const payload = serializeTaskComment(populatedComment);
    req.app.get('io').to(`user:${task.teacher._id.toString()}`).emit(SOCKET_EVENTS.COMMENT_CREATED, payload);
    req.app.get('io').to('role:admin').emit(SOCKET_EVENTS.COMMENT_CREATED, payload);

    res.status(201).json({
      success: true,
      comment: payload,
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not save comment.',
    });
  }
}

export async function deleteTask(req, res) {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found.',
      });
    }

    if (req.user.role === 'teacher' && task.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete this task.',
      });
    }

    await deleteTaskWithRelations(task);

    res.status(200).json({
      success: true,
      taskId: req.params.taskId,
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      error: 'Could not delete task.',
    });
  }
}
