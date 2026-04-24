import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';

export function useTheme(): ThemeColors & { isDark: boolean; scheme: 'light' | 'dark' } {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  return { ...colors, isDark, scheme: isDark ? 'dark' : 'light' };
}
