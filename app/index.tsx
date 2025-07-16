import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useProgramGeneration } from '@/hooks/useProgramGeneration';

export default function IndexScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const { isProfileLoading, ...userState } = useSelector((state: RootState) => state.user);
  const { checkExistingProgram } = useProgramGeneration();

  useEffect(() => {
    const handleNavigation = async () => {
      // Attendre que l'état d'authentification et le profil utilisateur soient déterminés
      if (isLoading || isProfileLoading) {
        console.log('⏳ En attente du chargement:', { isLoading, isProfileLoading });
        return;
      }

      console.log('🔍 Index - État actuel:', {
        isAuthenticated,
        isLoading,
        isProfileLoading,
        isOnboarded: userState.isOnboarded,
        userId: user ? user.uid : 'null',
        userPreferencesComplete: !!(userState.level && userState.goal && userState.diet && userState.selectedDays?.length > 0),
        email: user?.email,
        level: userState.level,
        goal: userState.goal,
        diet: userState.diet,
        selectedDays: userState.selectedDays,
        daysPerWeek: userState.daysPerWeek
      });

      if (!isAuthenticated || !user) {
        // Utilisateur non connecté
        console.log('🚪 Redirection vers login - utilisateur non connecté');
        router.replace('/(auth)/login');
        return;
      }

      // Vérifier si c'est l'admin
      if (user.email === 'fitrah.workout@gmail.com') {
        console.log('👑 Utilisateur admin détecté - redirection vers interface admin');
        router.replace('/(admin)');
        return;
      }

      // Utilisateur connecté - vérifier l'onboarding
      if (!userState.isOnboarded) {
        console.log('📝 Utilisateur non onboardé - redirection vers onboarding');
        router.replace('/onboarding');
        return;
      }

      // Utilisateur onboardé - vérifier s'il a un programme existant
      console.log('🔍 Vérification du programme existant...');
      try {
        const { hasProgram, program } = await checkExistingProgram();
        
        if (hasProgram && program) {
          console.log('✅ Programme existant trouvé - redirection directe vers les tabs');
          console.log('📊 Programme trouvé:', {
            name: program.name,
            workoutSessions: program.workoutPlan?.length || 0,
            nutritionDays: program.nutritionPlan?.length || 0,
            isActive: program.isActive
          });
          router.replace('/(tabs)');
        } else {
          console.log('❌ Aucun programme trouvé');
          
          // Vérifier si l'utilisateur a des préférences complètes pour génération automatique
          const hasCompletePreferences = userState.level && 
                                        userState.goal && 
                                        userState.diet && 
                                        userState.selectedDays?.length > 0;
          
          if (hasCompletePreferences) {
            console.log('📋 Préférences complètes trouvées - redirection vers setup pour génération automatique');
            console.log('📊 Préférences:', {
              level: userState.level,
              goal: userState.goal,
              diet: userState.diet,
              selectedDays: userState.selectedDays,
              daysPerWeek: userState.daysPerWeek
            });
            router.replace('/program-setup');
          } else {
            console.log('📋 Préférences incomplètes - redirection vers setup');
            router.replace('/program-setup');
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du programme:', error);
        // En cas d'erreur, rediriger vers setup pour être sûr
        router.replace('/program-setup');
      }
    };

    handleNavigation();
  }, [isAuthenticated, isLoading, isProfileLoading, userState.isOnboarded, userState.level, userState.goal, userState.diet, userState.selectedDays, user?.uid, user?.email, router, checkExistingProgram]);

  // Afficher le loading pendant la vérification
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6EC1E4" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});