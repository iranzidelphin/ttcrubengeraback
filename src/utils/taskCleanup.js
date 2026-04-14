import fs from 'node:fs/promises';
import path from 'node:path';
import { TaskComment } from '../models/TaskComment.js';
import { Task } from '../models/Task.js';

async function deleteTaskFile(fileUrl = '') {
  if (!fileUrl) {
    return;
  }

  const relativePath = fileUrl.replace(/^\/+/, '');
  const absolutePath = path.resolve(relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function deleteTaskWithRelations(task) {
  await TaskComment.deleteMany({ task: task._id });
  await deleteTaskFile(task.fileUrl);
  await task.deleteOne();
}

export async function deleteTasksByTeacher(teacherId) {
  const tasks = await Task.find({ teacher: teacherId });

  for (const task of tasks) {
    await deleteTaskWithRelations(task);
  }

  return tasks.length;
}
