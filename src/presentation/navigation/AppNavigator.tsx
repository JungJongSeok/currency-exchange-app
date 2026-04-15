/**
 * AppNavigator — single-screen Stack for the Currency Exchange app.
 */

import React from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';

import {ExchangeScreen} from '../screens/ExchangeScreen';
import {useTheme} from '../theme/ThemeProvider';
import {typography} from '../theme/typography';
import {platformTokens} from '../theme/platform';

export type RootStackParamList = {
  Exchange: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          gestureEnabled: platformTokens.gestureEnabled,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.textPrimary,
          headerShadowVisible: false,
          headerTitleStyle: {
            ...typography.headerTitle,
            color: theme.colors.textPrimary,
          },
          headerTitleAlign: Platform.OS === 'ios' ? 'center' : 'left',
        }}>
        <Stack.Screen
          name="Exchange"
          component={ExchangeScreen}
          options={{title: t('app.title')}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
