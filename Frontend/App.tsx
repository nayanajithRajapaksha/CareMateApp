import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SplashScreen } from './src/screens/SplashScreen';
import { LanguageScreen } from './src/screens/LanguageScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SignInSuccessScreen } from './src/screens/SignInSuccessScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { CheckEmailScreen } from './src/screens/CheckEmailScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { RegisterChildScreen } from './src/screens/RegisterChildScreen';

import { SelectClinicScreen } from './src/screens/SelectClinicScreen';
import { FindClinicScreen } from './src/screens/FindClinicScreen';
import { ClinicDetailsScreen } from './src/screens/ClinicDetailsScreen';
import { ChildRecordsScreen } from './src/screens/ChildRecordsScreen';
import { ManageAppointmentsScreen } from './src/screens/ManageAppointmentsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignInSuccess" component={SignInSuccessScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="RegisterChild" component={RegisterChildScreen} />
          <Stack.Screen name="SelectClinic" component={SelectClinicScreen} />
          <Stack.Screen name="FindClinic" component={FindClinicScreen} />
          <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
          <Stack.Screen name="ChildRecords" component={ChildRecordsScreen} />
          <Stack.Screen name="ManageAppointments" component={ManageAppointmentsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
