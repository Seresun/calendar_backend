import { Request, Response, NextFunction } from 'express';
import { fetchHolidays } from '../services/holidaysService';

export async function getHolidays(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { year, country } = req.query;

    if (typeof year !== 'string' || typeof country !== 'string') {
      return res.status(400).json({
        message: "Query parameters 'year' and 'country' are required",
        code: 'VALIDATION_ERROR',
      });
    }

    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        message: "Invalid 'year' format",
        code: 'VALIDATION_ERROR',
      });
    }

    if (!/^[A-Z]{2}$/.test(country)) {
      return res.status(400).json({
        message: "Invalid 'country' format, expected ISO 3166-1 alpha-2",
        code: 'VALIDATION_ERROR',
      });
    }

    const yearNumber = Number(year);

    const holidays = await fetchHolidays(yearNumber, country);

    return res.json(holidays);
  } catch (error) {
    next(error);
  }
}
