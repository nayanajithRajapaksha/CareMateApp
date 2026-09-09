export const colors = {
  primary: '#167979', // Teal/Dark Cyan from logo
  background: '#F7F9FA', // Light icy background
  white: '#FFFFFF',
  textDark: '#0B2B2B', // Dark Navy/Black for headings
  textMuted: '#6B7280', // Gray for subtitles/body
  border: '#D1D5DB', // Light gray for input borders
  success: '#10B981', // Green for success states
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.textDark,
  },
  body: {
    fontSize: 16,
    color: colors.textMuted,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  }
};

export const layout = {
  padding: 24,
  borderRadius: 12, // Rounded corners for buttons and inputs
};
