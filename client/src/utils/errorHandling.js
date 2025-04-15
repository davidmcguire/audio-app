// Error handling utility
const isDevelopment = process.env.NODE_ENV === 'development';

export const logError = (error, context = '') => {
  // In development, log detailed errors
  if (isDevelopment) {
    console.error(`[${context}] Error:`, error);
  }
  
  // In production, you might want to send to an error tracking service
  // like Sentry or LogRocket
  if (!isDevelopment) {
    // TODO: Implement production error tracking
    // Example: Sentry.captureException(error, { extra: { context } });
  }
};

export const logInfo = (message, context = '') => {
  if (isDevelopment) {
    console.log(`[${context}] Info:`, message);
  }
};

export const handleApiError = (error, setError) => {
  if (error.response) {
    // Server responded with error
    setError(error.response.data.message || 'An error occurred. Please try again.');
  } else if (error.request) {
    // Request made but no response
    setError('Unable to connect to server. Please check your connection.');
  } else {
    // Something else went wrong
    setError('An unexpected error occurred. Please try again.');
  }
  
  logError(error);
}; 