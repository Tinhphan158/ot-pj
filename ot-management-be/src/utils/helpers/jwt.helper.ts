/**
 * Parse an expiry string like "15m", "7d", "3600s", "12h" into seconds.
 * A bare number is treated as seconds.
 */
export const JwtHelper = {
  parseExpiresToSeconds(expires: string): number {
    const match = /^(\d+)([smhd])?$/.exec(expires.trim());
    if (!match) return 0;
    const value = Number(match[1]);
    const unit = match[2];
    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return value;
    }
  },
};
