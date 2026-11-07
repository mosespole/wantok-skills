export const APP_NAME = 'Wantok Skills';
export const APP_TAGLINE = 'Connecting Skills. Empowering Communities.';

/** Tok Pisin slogan on the Home banner ("make work easy"). */
export const APP_SLOGAN_TOK_PISIN = 'Mekim wok i isi.';

/** Tok Pisin greeting for the time of day, shown above the user's name on Home. */
export function tokPisinGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Moning';
  if (hour < 18) return 'Apinun';
  return 'Halo';
}
