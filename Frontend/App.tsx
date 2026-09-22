import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { AuthProvider } from './src/context/AuthContext';

import { SplashScreen } from './src/screens/SplashScreen';
import { LanguageScreen } from './src/screens/LanguageScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SignInScreen } from './src/screens/SignInScreen';
import { SignUpScreen } from './src/screens/SignUpScreen';
import { SignInSuccessScreen } from './src/screens/SignInSuccessScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/screens/ResetPasswordScreen';
import { CheckEmailScreen } from './src/screens/CheckEmailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { ChildVaccinationScreen } from './src/screens/ChildVaccinationScreen';
import { VaccineMilestonesScreen } from './src/screens/VaccineMilestonesScreen';
import { SupervisorDashboardScreen } from './src/screens/SupervisorDashboardScreen';
import { RegisterChildScreen } from './src/screens/RegisterChildScreen';
import { PreconceptionCareScreen } from './src/screens/PreconceptionCareScreen';
import { NutritionGuideScreen } from './src/screens/NutritionGuideScreen';
import { FamilyPlanningMethodsScreen } from './src/screens/FamilyPlanningMethodsScreen';

import { SelectClinicScreen } from './src/screens/SelectClinicScreen';
import { FindClinicScreen } from './src/screens/FindClinicScreen';
import { ClinicDetailsScreen } from './src/screens/ClinicDetailsScreen';
import { ChildRecordsScreen } from './src/screens/ChildRecordsScreen';
import { ManageAppointmentsScreen } from './src/screens/ManageAppointmentsScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
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
            <Stack.Screen name="Notification" component={NotificationScreen} />
            <Stack.Screen name="ChildVaccination" component={ChildVaccinationScreen} />
            <Stack.Screen name="VaccineMilestones" component={VaccineMilestonesScreen} />
            <Stack.Screen name="PreconceptionCare" component={PreconceptionCareScreen} />
            <Stack.Screen name="NutritionGuide" component={NutritionGuideScreen} />
            <Stack.Screen name="FamilyPlanningMethods" component={FamilyPlanningMethodsScreen} />
            <Stack.Screen name="SupervisorDashboard" component={SupervisorDashboardScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
