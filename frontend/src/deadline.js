// datetime-local has no timezone: read and write it in the device's local time, send UTC.
export function toApiDeadline(localValue) {
  return localValue ? new Date(localValue).toISOString() : null;
}

export function toLocalInput(isoValue) {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
