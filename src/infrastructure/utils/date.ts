// src/infrastructure/utils/date.ts

/**
 * Format a date as YYYY-MM-DD
 */
export const formatDateYMD = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Format a date as HH:MM (24 hour)
 */
export const formatTime24 = (date: Date): string => {
  return date.toTimeString().substring(0, 5);
};

/**
 * Format a date as HH:MM AM/PM (12 hour)
 */
export const formatTime12 = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Format date as "Month Day, Year" (e.g., "January 1, 2025")
 */
export const formatDateFull = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get the current date at start of day (midnight)
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

/**
 * Get the current date at end of day (23:59:59.999)
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

/**
 * Check if a restaurant is open based on the current time and operating hours
 */
export const isRestaurantOpen = (
  currentTime: Date = new Date(),
  openingTime: string = "10:00",
  closingTime: string = "22:00"
): boolean => {
  // Get hours and minutes
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();

  // Parse opening time
  const [openHours, openMinutes] = openingTime.split(":").map(Number);

  // Parse closing time
  const [closeHours, closeMinutes] = closingTime.split(":").map(Number);

  // Convert times to minutes for easier comparison
  const currentTimeInMinutes = hours * 60 + minutes;
  const openingTimeInMinutes = openHours * 60 + openMinutes;
  const closingTimeInMinutes = closeHours * 60 + closeMinutes;

  return (
    currentTimeInMinutes >= openingTimeInMinutes &&
    currentTimeInMinutes <= closingTimeInMinutes
  );
};

/**
 * Calculate the estimated delivery time (e.g., for delivery orders)
 */
export const calculateEstimatedDeliveryTime = (
  orderTime: Date = new Date(),
  preparationMinutes: number = 20,
  deliveryMinutes: number = 30
): Date => {
  const estimatedTime = new Date(orderTime);
  estimatedTime.setMinutes(
    estimatedTime.getMinutes() + preparationMinutes + deliveryMinutes
  );
  return estimatedTime;
};

/**
 * Format a duration in milliseconds to a human-readable string
 */
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
