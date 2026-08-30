import { useColorScheme as useRNColorScheme } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export function useColorScheme(): ColorScheme {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
