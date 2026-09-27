export function getTrimmedString(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

export function getOptionalTrimmedString(
  value: unknown,
): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

export function isValidString(
  value: unknown,
  minLength = 1,
  maxLength = Infinity,
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const length = value.trim().length;

  return length >= minLength && length <= maxLength;
}

export function getBoundedNumber(
  value: unknown,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return Math.min(
    Math.max(Math.floor(parsed), min),
    max,
  );
}

export function isValidId(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value.trim(),
  );
}

export function isValidUsername(
  value: unknown,
): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const username = value.trim().toLowerCase();

  return (
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-z0-9_]+$/.test(username)
  );
}

export function clampPagination(
  pageValue: unknown,
  limitValue: unknown,
) {
  const page = getBoundedNumber(
    pageValue,
    1,
    1,
    1000,
  );

  const limit = getBoundedNumber(
    limitValue,
    20,
    1,
    50,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
