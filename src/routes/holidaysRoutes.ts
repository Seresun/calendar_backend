import { Router } from 'express';
import { getHolidays } from '../controllers/holidaysController';

const router = Router();

router.get('/', (req, res, next) => {
  void getHolidays(req, res, next);
});

export default router;
