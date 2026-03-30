import slugify from "slugify";

export function createSlug(text: string): string {
  return slugify(text, { lower: true, strict: true });
}

export function parseJsonField<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function isCurrentlyOpen(hoursJson: string): boolean {
  const hours = parseJsonField<Array<{
    day: string;
    open: string;
    close: string;
    closed: boolean;
  }>>(hoursJson, []);

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[now.getDay()];
  const todayHours = hours.find((h) => h.day === today);

  if (!todayHours || todayHours.closed) return false;

  const parseTime = (timeStr: string): number => {
    const [time, period] = timeStr.split(" ");
    const parts = time.split(":");
    let hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1] || "0");
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTime(todayHours.open);
  const closeMinutes = parseTime(todayHours.close);

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}
