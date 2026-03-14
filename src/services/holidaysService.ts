import axios, { AxiosError } from 'axios';

export interface HolidayDto {
  date: string; // YYYY-MM-DD
  localName: string;
}

const NAGER_BASE_URL =
  process.env.NAGER_BASE_URL || 'https://date.nager.at/api/v3';

interface NagerHoliday {
  date: string;
  localName: string;
}

export async function fetchHolidays(
  year: number,
  country: string,
): Promise<HolidayDto[]> {
  const url = `${NAGER_BASE_URL}/PublicHolidays/${year}/${country}`;

  try {
    const response = await axios.get<NagerHoliday[]>(url);

    return response.data.map((h) => ({
      date: h.date.slice(0, 10),
      localName: h.localName,
    }));
  } catch (err) {
    const error = err as AxiosError;

    const status = error.response?.status;

    const message =
      status && status >= 400 && status < 500
        ? 'Failed to fetch holidays from external API'
        : 'Unexpected error while calling external holidays API';

    const customError = new Error(message) as Error & { statusCode?: number };
    customError.statusCode = typeof status === 'number' ? status : 502;

    throw customError;
  }
}
