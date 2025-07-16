import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Heart, Target, Sparkles } from 'lucide-react-native';

export default function OnboardingWelcome() {
  const router = useRouter();

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(110,193,228,0.8)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://i.imgur.com/m0ebU8Q.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <Text style={styles.title}>Bienvenue dans Fitrah</Text>
          <Text style={styles.subtitle}>
            Votre coach fitness et nutrition personnalisé
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Target size={32} color="#6EC1E4" />
              <Text style={styles.featureText}>Programmes sur mesure</Text>
            </View>
            <View style={styles.feature}>
              <Heart size={32} color="#6EC1E4" />
              <Text style={styles.featureText}>Suivi intuitif</Text>
            </View>
            <View style={styles.feature}>
              <Sparkles size={32} color="#6EC1E4" />
              <Text style={styles.featureText}>Motivation quotidienne</Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/onboarding/level')}
          >
            <LinearGradient
              colors={['#6EC1E4', '#4A90E2']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Commencer 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#6EC1E4',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 50,
    opacity: 0.9,
  },
  featuresContainer: {
    marginBottom: 50,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 12,
    minWidth: 250,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    marginLeft: 15,
  },
  button: {
    width: '100%',
    borderRadius: 25,
    overflow: 'hidden',
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