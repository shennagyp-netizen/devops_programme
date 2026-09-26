export function shouldRetryTutorStatus(status: number) {
  return status === 502 || status === 503;
}

export function tutorRetryDelayMs(attempt: number) {
  return attempt === 0 ? 250 : 750;
}
