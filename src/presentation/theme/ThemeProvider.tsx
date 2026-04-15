/**
 * ThemeProvider — supplies Material Design 3 tokens to the component tree via
 * React context, reacting to the system colour scheme.
 */

import React, {createContext, useContext} from 'react';
import {useColorScheme} from 'react-native';

import {type AppTheme, darkTheme, lightTheme} from './index';

export type {AppTheme};

const ThemeContext = createContext<AppTheme>(lightTheme);

export interface ThemeProviderProps {
  readonly children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  const scheme = useColorScheme();
  const theme: AppTheme = scheme === 'dark' ? darkTheme : lightTheme;
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): AppTheme => useContext(ThemeContext);
