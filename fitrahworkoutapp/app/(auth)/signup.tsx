import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useDispatch } from 'react-redux';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { setError, setLoading } from '@/store/slices/authSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import AppHeader from '@/components/AppHeader';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer un email valide');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    dispatch(setLoading(true));

    try {
      console.log('🔐 Tentative de création de compte pour:', email);
      console.log('🔐 Nom:', name);
      console.log('🔐 Longueur du mot de passe:', password.length);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Compte créé avec succès:', userCredential.user.uid);
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      console.log('✅ Profil utilisateur mis à jour avec le nom:', name);
      
      // Attendre un peu pour que l'état soit mis à jour
      setTimeout(() => {
        console.log('🏠 Tentative de navigation après inscription');
        router.replace('/');
      }, 100);
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du compte:', error);
      console.error('❌ Code d\'erreur Firebase:', error.code);
      console.error('❌ Message d\'erreur Firebase:', error.message);
      let errorMessage = 'Une erreur est survenue';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'La création de compte est temporairement désactivée';
          break;
        case 'auth/missing-password':
          errorMessage = 'Veuillez saisir un mot de passe';
          break;
        case 'auth/missing-email':
          errorMessage = 'Veuillez saisir un email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        default:
          // Pour les erreurs non gérées, afficher un message générique
          errorMessage = 'Erreur lors de la création du compte. Réessayez plus tard.';
          console.error('❌ Erreur non gérée:', error.code, error.message);
      }
      
      dispatch(setError(errorMessage));
      Alert.alert('Erreur d\'inscription', errorMessage);
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AppHeader 
          title="Rejoignez Fitrah" 
          subtitle="Créez votre compte pour commencer votre transformation"
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
              <User size={20} color="#6EC1E4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom complet"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
            </View>
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

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#6EC1E4" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#999999" />
                ) : (
                  <Eye size={20} color="#999999" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#CCCCCC', '#AAAAAA'] : ['#6EC1E4', '#4A90E2']}
              style={styles.signupButtonGradient}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Création...' : 'Créer mon compte'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Se connecter</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
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
  signupButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 30,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  signupButtonText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  loginLink: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
  },
});