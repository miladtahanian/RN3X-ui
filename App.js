import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Text, TextInput, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

function AppContent() {
  const { direction } = useLanguage();

  const isRTL = direction === 'rtl';
  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { writingDirection: direction };
  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = { writingDirection: direction, textAlign: isRTL ? 'right' : 'left' };

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <LanguageProvider>
          <SafeAreaView style={{flex:1}}>
            <AppContent />
          </SafeAreaView>
        </LanguageProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
