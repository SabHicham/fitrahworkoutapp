import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, TrendingDown, Dumbbell, Zap } from 'lucide-react-native';

export default function OnboardingGoal() {
  const router = useRouter();
  const dispatch = useDispatch();

  const goals = [
    { value: 'Perdre du poids' as const, title: 'Perdre du poids ⚖️', description: 'Brûler les graisses et affiner ma silhouette', icon: TrendingDown },
    { value: 'Prise de muscle' as const, title: 'Prise de muscle 💪', description: 'Développer ma masse musculaire', icon: Dumbbell },
    { value: 'Performance' as const, title: 'Performance 🏃‍♂️', description: 'Améliorer ma condition physique', icon: Zap },
  ];

  const handleSelectGoal = (goal: 'Perdre du poids' | 'Prise de muscle' | 'Performance') => {
    dispatch(setUserData({ goal }));
    router.push('/onboarding/diet');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#6EC1E4" />
      </TouchableOpacity>

      <Text style={styles.title}>Quel est votre objectif ?</Text>
      <Text style={styles.subtitle}>
        Choisissez votre objectif principal pour adapter votre programme
      </Text>

      <View style={styles.optionsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.value}
            style={styles.option}
            onPress={() => handleSelectGoal(goal.value)}
          >
            <LinearGradient
              colors={['#6EC1E4', '#4A90E2']}
              style={styles.iconContainer}
            >
              <goal.icon size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{goal.title}</Text>
              <Text style={styles.optionDescription}>{goal.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
        <Text style={styles.progressText}>2 / 4</Text>
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