import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '@/store/slices/userSlice';
import { RootState } from '@/store/store';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useProgramGeneration } from '@/hooks/useProgramGeneration';

export default function OnboardingComplete() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const userState = useSelector((state: RootState) => state.user);
  const { generateNewProgram } = useProgramGeneration();
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    if (isLoading) return;
    
    if (!user) {
      console.error('❌ Utilisateur non authentifié');
      Alert.alert('Erreur', 'Utilisateur non authentifié. Veuillez vous reconnecter.');
      router.replace('/(auth)/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🚀 Début de la finalisation pour l\'utilisateur:', user.uid);
      console.log('📊 Données utilisateur à sauvegarder:', userState);
      
      // Préparer les données complètes pour Firestore
      const profileData = {
        // Données d'authentification
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        
        // Données d'onboarding
        name: user.displayName || userState.name || 'Champion',
        level: userState.level,
        goal: userState.goal,
        diet: userState.diet,
        selectedDays: userState.selectedDays,
        daysPerWeek: userState.daysPerWeek,
        age: userState.age,
        height: userState.height,
        weight: userState.weight,
        
        // État de l'application
        isOnboarded: true,
        
        // Données par défaut
        badges: userState.badges || [],
        achievements: userState.achievements || [],
        disciplineScore: userState.disciplineScore || 0,
        
        // Timestamps (will be converted to serverTimestamp by Firestore)
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('💾 Tentative de sauvegarde dans Firestore...');
      console.log('📄 Document path: users/' + user.uid);
      console.log('📊 Données à sauvegarder:', {
        level: profileData.level,
        goal: profileData.goal,
        diet: profileData.diet,
        selectedDays: profileData.selectedDays,
        daysPerWeek: profileData.daysPerWeek
      });
      
      // Sauvegarder dans Firestore avec gestion d'erreur explicite
      await setDoc(doc(db, 'users', user.uid), profileData);
      
      console.log('✅ Profil sauvegardé avec succès dans Firestore');
      
      // Générer automatiquement le programme utilisateur
      console.log('🎯 Génération automatique du programme...');
      const programPreferences = {
        level: userState.level,
        goal: userState.goal,
        diet: userState.diet,
        selectedDays: userState.selectedDays || ['monday', 'wednesday', 'friday'],
        daysPerWeek: userState.daysPerWeek,
      };
      
      const programResult = await generateNewProgram(programPreferences);
      
      if (programResult.success) {
        console.log('✅ Programme généré automatiquement avec succès');
      } else {
        console.warn('⚠️ Échec de la génération automatique du programme, mais on continue');
        // On ne bloque pas l'utilisateur même si la génération échoue
      }
      
      // Mettre à jour le state Redux local avec des dates sérialisées
      dispatch(setUserData({ 
        name: profileData.name,
        level: profileData.level,
        goal: profileData.goal,
        diet: profileData.diet,
        selectedDays: profileData.selectedDays,
        daysPerWeek: profileData.daysPerWeek,
        isOnboarded: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      console.log('✅ State Redux mis à jour');
      
      // Navigation vers les tabs (le programme est maintenant disponible)
      console.log('🏠 Navigation vers les tabs');
      router.replace('/(tabs)');
      
    } catch (error: any) {
      console.error('❌ Erreur lors de la finalisation:', error);
      console.error('❌ Code d\'erreur:', error.code);
      console.error('❌ Message d\'erreur:', error.message);
      console.error('❌ Stack trace:', error.stack);
      
      // Afficher l'erreur à l'utilisateur
      Alert.alert(
        'Erreur de sauvegarde',
        `Impossible de sauvegarder votre profil: ${error.message}`,
        [
          {
            text: 'Réessayer',
            onPress: handleComplete
          },
          {
            text: 'Continuer quand même',
            style: 'destructive',
            onPress: () => {
              // Permettre de continuer même en cas d'erreur Firestore
              dispatch(setUserData({ 
                name: user.displayName || 'Champion',
                isOnboarded: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }));
              // Rediriger vers program-setup si la sauvegarde a échoué
              router.replace('/program-setup');
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6EC1E4', '#4A90E2']}
        style={styles.iconContainer}
      >
        <CheckCircle size={48} color="#FFFFFF" />
      </LinearGradient>
      
      <Text style={styles.title}>Félicitations ! 🎉</Text>
      <Text style={styles.subtitle}>
        Votre programme personnalisé est prêt, {user?.displayName || 'Champion'} !
      </Text>

      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Sparkles size={20} color="#6EC1E4" />
          <Text style={styles.featureText}>Programme adapté à votre niveau</Text>
        </View>
        <View style={styles.feature}>
          <Sparkles size={20} color="#6EC1E4" />
          <Text style={styles.featureText}>Recettes selon vos préférences</Text>
        </View>
        <View style={styles.feature}>
          <Sparkles size={20} color="#6EC1E4" />
          <Text style={styles.featureText}>Suivi de vos progrès</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleComplete}
        disabled={isLoading}
      >
        <LinearGradient
          colors={!isLoading ? ['#6EC1E4', '#4A90E2'] : ['#CCCCCC', '#AAAAAA']}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Finalisation...' : 'Commencer mon parcours ! 🚀'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginLeft: 12,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
});