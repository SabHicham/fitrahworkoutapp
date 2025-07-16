import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Dumbbell, ChefHat, Calendar, ChartBar as BarChart3, Users, Settings, LogOut } from 'lucide-react-native';
import { dataSeedingService } from '@/services/dataSeedingService';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Image } from 'react-native';
import AppHeader from '@/components/AppHeader';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [seeding, setSeeding] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    exercises: 0,
    recipes: 0,
    programs: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { exercisesExist, recipesExist } = await dataSeedingService.checkIfDataExists();
      // Ici vous pourriez charger les vraies statistiques depuis Firestore
      setStats({
        users: 0,
        exercises: exercisesExist ? 25 : 0,
        recipes: recipesExist ? 20 : 0,
        programs: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await dataSeedingService.seedDatabase();
      if (result.success) {
        Alert.alert(
          'Base de données initialisée',
          `✅ Exercices: ${result.results.exercises.message} (${result.results.exercises.count})\n✅ Recettes: ${result.results.recipes.message} (${result.results.recipes.count})`
        );
        loadStats();
      } else {
        Alert.alert('Erreur', 'Impossible d\'initialiser la base de données');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'initialisation');
    } finally {
      setSeeding(false);
    }
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const adminSections = [
    {
      title: 'Exercices',
      description: 'Gérer la bibliothèque d\'exercices',
      icon: Dumbbell,
      route: '/(admin)/exercises',
      color: ['#6EC1E4', '#4A90E2'],
    },
    {
      title: 'Recettes',
      description: 'Gérer les recettes et plans alimentaires',
      icon: ChefHat,
      route: '/(admin)/recipes',
      color: ['#28A745', '#20C997'],
    },
    {
      title: 'Programmes',
      description: 'Créer et modifier les programmes d\'entraînement',
      icon: Calendar,
      route: '/(admin)/programs',
      color: ['#FF6B6B', '#FF8E8E'],
    },
    {
      title: 'Statistiques',
      description: 'Analyser l\'utilisation de l\'application',
      icon: BarChart3,
      route: '/(admin)/statistics',
      color: ['#9C27B0', '#BA68C8'],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Interface Administrateur" 
        subtitle="Gestion des contenus Fitrah"
      />
      
      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfo}>
          Connecté en tant que: {user?.email}
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Aperçu rapide</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={24} color="#6EC1E4" />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Dumbbell size={24} color="#28A745" />
            <Text style={styles.statValue}>{stats.exercises}</Text>
            <Text style={styles.statLabel}>Exercices</Text>
          </View>
          
          <View style={styles.statCard}>
            <ChefHat size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{stats.recipes}</Text>
            <Text style={styles.statLabel}>Recettes</Text>
          </View>
          
          <View style={styles.statCard}>
            <Calendar size={24} color="#9C27B0" />
            <Text style={styles.statValue}>{stats.programs}</Text>
            <Text style={styles.statLabel}>Programmes</Text>
          </View>
        </View>
      </View>

      {/* Quick Setup */}
      {(stats.exercises === 0 || stats.recipes === 0) && (
        <View style={styles.setupSection}>
          <Text style={styles.sectionTitle}>Configuration initiale</Text>
          <TouchableOpacity
            style={[styles.setupButton, seeding && styles.setupButtonDisabled]}
            onPress={handleSeedData}
            disabled={seeding}
          >
            <LinearGradient
              colors={seeding ? ['#CCCCCC', '#AAAAAA'] : ['#28A745', '#20C997']}
              style={styles.setupButtonGradient}
            >
              <Settings size={24} color="#FFFFFF" />
              <Text style={styles.setupButtonText}>
                {seeding ? 'Initialisation...' : 'Initialiser la base de données'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.setupDescription}>
            Ajoute automatiquement 25+ exercices et 20+ recettes pour commencer
          </Text>
        </View>
      )}

      {/* Admin Sections */}
      <View style={styles.sectionsContainer}>
        <Text style={styles.sectionTitle}>Gestion des contenus</Text>
        {adminSections.map((section, index) => (
          <TouchableOpacity
            key={index}
            style={styles.sectionCard}
            onPress={() => router.push(section.route as any)}
          >
            <LinearGradient
              colors={section.color}
              style={styles.sectionIcon}
            >
              <section.icon size={32} color="#FFFFFF" />
            </LinearGradient>
            
            <View style={styles.sectionContent}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDescription}>{section.description}</Text>
            </View>
            
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <View style={styles.signOutSection}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#DC3545" />
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  userInfoContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#E8F6FD',
    borderRadius: 12,
    alignItems: 'center',
  },
  userInfo: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#4A90E2',
    textAlign: 'center',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  sectionsContainer: {
    padding: 20,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginTop: 4,
  },
  arrow: {
    marginLeft: 16,
  },
  arrowText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#CED4DA',
  },
  signOutSection: {
    padding: 20,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DC3545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#DC3545',
    marginLeft: 8,
  },
  setupSection: {
    padding: 20,
    backgroundColor: '#E8F5E8',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  setupButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  setupButtonDisabled: {
    opacity: 0.7,
  },
  setupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  setupButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  setupDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});