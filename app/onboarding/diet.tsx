import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Utensils, Leaf, Wheat, Heart } from 'lucide-react-native';

export default function OnboardingDiet() {
  const router = useRouter();
  const dispatch = useDispatch();

  const diets = [
    { value: 'Standard' as const, title: 'Standard 🍽️', description: 'Alimentation équilibrée classique', icon: Utensils },
    { value: 'Végétarien' as const, title: 'Végétarien 🥗', description: 'Sans viande ni poisson', icon: Leaf },
    { value: 'Vegan' as const, title: 'Vegan 🌱', description: 'Aucun produit d\'origine animale', icon: Heart },
    { value: 'Sans gluten' as const, title: 'Sans gluten 🌾', description: 'Éviter le gluten', icon: Wheat },
  ];

  const handleSelectDiet = (diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten') => {
    dispatch(setUserData({ diet }));
    router.push('/onboarding/schedule');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#6EC1E4" />
      </TouchableOpacity>

      <Text style={styles.title}>Quel régime suivez-vous ?</Text>
      <Text style={styles.subtitle}>
        Sélectionnez votre type d'alimentation pour des repas adaptés
      </Text>

      <View style={styles.optionsContainer}>
        {diets.map((diet) => (
          <TouchableOpacity
            key={diet.value}
            style={styles.option}
            onPress={() => handleSelectDiet(diet.value)}
          >
            <LinearGradient
              colors={['#6EC1E4', '#4A90E2']}
              style={styles.iconContainer}
            >
              <diet.icon size={32} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{diet.title}</Text>
              <Text style={styles.optionDescription}>{diet.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
        <Text style={styles.progressText}>3 / 4</Text>
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