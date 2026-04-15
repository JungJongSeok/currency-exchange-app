import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Provider} from 'react-redux';

import {DependencyProvider} from './src/di/DependencyProvider';
import './src/i18n';
import {AppNavigator} from './src/presentation/navigation/AppNavigator';
import {ThemeProvider} from './src/presentation/theme/ThemeProvider';
import {store} from './src/store/store';

function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <DependencyProvider>
          <ThemeProvider>
            <SafeAreaProvider>
              <BottomSheetModalProvider>
                <AppNavigator />
              </BottomSheetModalProvider>
            </SafeAreaProvider>
          </ThemeProvider>
        </DependencyProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

export default App;
