import { Stack } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function AdminLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur a accès à l'interface admin
    if (!user || user.email !== 'fitrah.workout@gmail.com') {
      console.log('❌ Accès admin refusé pour:', user?.email);
      router.replace('/(auth)/login');
    }
  }, [user, router]);

  // Si l'utilisateur n'est pas admin, afficher un message d'erreur
  if (!user || user.email !== 'fitrah.workout@gmail.com') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Accès non autorisé</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="exercises" />
      <Stack.Screen name="recipes" />
      <Stack.Screen name="programs" />
      <Stack.Screen name="statistics" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#DC3545',
  },
});