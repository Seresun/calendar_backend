import { Request, Response, NextFunction } from 'express';
import { Task, ITask } from '../models/Task';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateString(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export async function getTasksByMonth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { year, month } = req.query;

    if (typeof year !== 'string' || typeof month !== 'string') {
      return res.status(400).json({
        message: "Query parameters 'year' and 'month' are required",
        code: 'VALIDATION_ERROR',
      });
    }

    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Invalid 'year' or 'month' format",
        code: 'VALIDATION_ERROR',
      });
    }

    const prefix = `${year}-${month}`;

    const startDate = `${prefix}-01`;
    const endDate = `${prefix}-31`;

    const tasks: ITask[] = await Task.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1, order: 1 })
      .exec();

    return res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { date, text, color, completed } = req.body as {
      date?: string;
      text?: string;
      color?: string;
      completed?: boolean;
    };

    const errors: string[] = [];

    if (!date) {
      errors.push("Field 'date' is required");
    } else if (!isValidDateString(date)) {
      errors.push("Field 'date' must be a valid date in format YYYY-MM-DD");
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      errors.push("Field 'text' is required and must be a non-empty string");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }

    const lastTask = await Task.findOne({ date }).sort({ order: -1 }).exec();

    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    const safeText = (text as string).trim();

    const task = new Task({
      date,
      text: safeText,
      order: nextOrder,
      color,
      completed: completed ?? false,
    });

    const saved = await task.save();

    return res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const { text, date, order, color, completed } = req.body as Partial<{
      text: string;
      date: string;
      order: number;
      color: string;
      completed: boolean;
    }>;

    const updates: Partial<ITask> = {};
    const errors: string[] = [];

    if (
      text === undefined &&
      date === undefined &&
      order === undefined &&
      color === undefined &&
      completed === undefined
    ) {
      return res.status(400).json({
        message: 'No updatable fields provided',
        code: 'VALIDATION_ERROR',
      });
    }

    if (text !== undefined) {
      if (typeof text !== 'string' || !text.trim()) {
        errors.push("Field 'text' must be a non-empty string when provided");
      } else {
        updates.text = text.trim();
      }
    }

    if (date !== undefined) {
      if (!isValidDateString(date)) {
        errors.push("Field 'date' must be a valid date in format YYYY-MM-DD");
      } else {
        updates.date = date;
      }
    }

    if (order !== undefined) {
      if (typeof order !== 'number' || !Number.isInteger(order) || order < 0) {
        errors.push(
          "Field 'order' must be a non-negative integer when provided",
        );
      } else {
        updates.order = order;
      }
    }

    if (color !== undefined) {
      if (typeof color !== 'string') {
        errors.push("Field 'color' must be a string when provided");
      } else {
        updates.color = color;
      }
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        errors.push("Field 'completed' must be a boolean when provided");
      } else {
        updates.completed = completed;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }

    const updated = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    }).exec();

    if (!updated) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'NOT_FOUND',
      });
    }

    return res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).exec();

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
        code: 'NOT_FOUND',
      });
    }

    const date = task.date;

    await task.deleteOne();

    const sameDayTasks = await Task.find({ date }).sort({ order: 1 }).exec();

    for (let index = 0; index < sameDayTasks.length; index += 1) {
      if (sameDayTasks[index].order !== index) {
        sameDayTasks[index].order = index;
        await sameDayTasks[index].save();
      }
    }

    return res.json({ id });
  } catch (error) {
    next(error);
  }
}
