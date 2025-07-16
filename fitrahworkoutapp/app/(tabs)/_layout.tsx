import { Tabs } from 'expo-router';
import { Chrome as Home, User, Timer } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#6EC1E4',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E9ECEF',
            height: 90,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: 'Montserrat-Medium',
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="training"
          options={{
            title: 'Entraînement',
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="fitness-center" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="restaurant" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Fitrah Fiche',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Minuteur',
            tabBarIcon: ({ size, color }) => (
              <Timer size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}