import axios from 'axios';
import type { ApiProblem } from '../types/api';

export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiProblem>(error)) {
    const apiProblem = error.response?.data;
    if (apiProblem?.detail) {
      return apiProblem.detail;
    }

    const firstFieldError = apiProblem?.errors ? Object.values(apiProblem.errors)[0] : undefined;
    if (firstFieldError) {
      return firstFieldError;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
