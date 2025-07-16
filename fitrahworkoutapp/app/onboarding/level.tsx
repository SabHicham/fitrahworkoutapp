import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, TrendingUp, Award } from 'lucide-react-native';

export default function OnboardingLevel() {
  const router = useRouter();
  const dispatch = useDispatch();

  const levels = [
    { value: 'Débutant' as const, title: 'Débutant 🌱', description: 'Je débute ma remise en forme', icon: Zap },
    { value: 'Intermédiaire' as const, title: 'Intermédiaire 💪', description: 'J\'ai déjà une base d\'entraînement', icon: TrendingUp },
    { value: 'Avancé' as const, title: 'Avancé 🔥', description: 'Je m\'entraîne régulièrement', icon: Award },
  ];

  const handleSelectLevel = (level: 'Débutant' | 'Intermédiaire' | 'Avancé') => {
    dispatch(setUserData({ level }));
    router.push('/onboarding/goal');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#6EC1E4" />
      </TouchableOpacity>

      <Text style={styles.title}>Quel est votre niveau ?</Text>
      <Text style={styles.subtitle}>
        Sélectionnez votre niveau actuel pour recevoir un programme adapté
      </Text>

      <View style={styles.optionsContainer}>
        {levels.map((level) => (
          <TouchableOpacity
            key={level.value}
            style={styles.option}
            onPress={() => handleSelectLevel(level.value)}
          >
            <LinearGradient
              colors={['#6EC1E4', '#4A90E2']}
              style={styles.iconContainer}
            >
              <level.icon size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{level.title}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
        <Text style={styles.progressText}>1 / 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
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
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  progress: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EC1E4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
});