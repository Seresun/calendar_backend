import { Router } from 'express';
import {
  getTasksByMonth,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasksController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getTasksByMonth));
router.post('/', asyncHandler(createTask));
router.put('/:id', asyncHandler(updateTask));
router.delete('/:id', asyncHandler(deleteTask));

export default router;
