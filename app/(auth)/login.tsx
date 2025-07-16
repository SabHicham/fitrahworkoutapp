import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { setError, setLoading } from '@/store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import AppHeader from '@/components/AppHeader';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      console.log('🔐 Tentative de connexion pour:', email);
      console.log('🔐 Longueur du mot de passe:', password.length);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion réussie');
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        console.log('🏠 Tentative de navigation après connexion');
        router.replace('/');
      }, 100);
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      console.error('❌ Code d\'erreur Firebase:', error.code);
      console.error('❌ Message d\'erreur Firebase:', error.message);
      let errorMessage = 'Une erreur est survenue';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte n\'est associé à cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        case 'auth/invalid-credential':
          // Cette erreur peut signifier soit un mauvais email soit un mauvais mot de passe
          // Firebase ne fait plus la distinction pour des raisons de sécurité
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
          break;
        case 'auth/missing-password':
          errorMessage = 'Veuillez saisir un mot de passe';
          break;
        case 'auth/missing-email':
          errorMessage = 'Veuillez saisir un email';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
          break;
        default:
          // Pour les erreurs non gérées, afficher un message générique
          errorMessage = 'Erreur de connexion. Vérifiez vos identifiants et réessayez.';
          console.error('❌ Erreur non gérée:', error.code, error.message);
      }
      
      dispatch(setError(errorMessage));
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <AppHeader 
        title="Bienvenue dans Fitrah" 
        subtitle="Connectez-vous pour accéder à votre coach personnel"
      />

      <View style={styles.formContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://i.imgur.com/m0ebU8Q.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#6EC1E4" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#6EC1E4" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#999999"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#999999" />
              ) : (
                <Eye size={20} color="#999999" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient
            colors={isLoading ? ['#CCCCCC', '#AAAAAA'] : ['#6EC1E4', '#4A90E2']}
            style={styles.loginButtonGradient}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Pas encore de compte ? </Text>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Créer un compte</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  formContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#333333',
  },
  eyeIcon: {
    padding: 16,
  },
  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  signupLink: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
  },
});