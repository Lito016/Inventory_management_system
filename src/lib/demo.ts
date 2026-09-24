export function demoFlagOn(value: string | undefined): boolean {
  return value === 'true';
}

export function isDemoMode(): boolean {
  return demoFlagOn(import.meta.env.VITE_DEMO);
}
