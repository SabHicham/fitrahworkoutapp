import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '@/store/store';
import { Target, Clock, TrendingUp, Award, Calendar, Zap, ChevronRight, Play, Sparkles, Scale } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import ProfileMenu from '@/components/ProfileMenu';
import AppHeader from '@/components/AppHeader';

export default function HomeScreen() {
  const router = useRouter();
  const { name, goal, level, weight } = useSelector((state: RootState) => state.user);
  const { user } = useSelector((state: RootState) => state.auth);
  const { consumedCalories } = useSelector((state: RootState) => state.user);
  
  // États pour les données dynamiques
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [nutritionStats, setNutritionStats] = useState({ target: 2000 });
  const [lastGoal, setLastGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Messages motivationnels personnalisés selon l'objectif
  const getPersonalizedMessage = () => {
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Bonjour' : timeOfDay < 18 ? 'Bon après-midi' : 'Bonsoir';
    
    const messages = {
      'Perdre du poids': [
        `${greeting} ${name || 'Champion'} ! 🔥 Chaque calorie brûlée vous rapproche de votre objectif !`,
        `${greeting} ${name || 'Champion'} ! 💪 Votre transformation commence maintenant !`,
        `${greeting} ${name || 'Champion'} ! ⚡ Aujourd'hui est parfait pour progresser !`
      ],
      'Prise de muscle': [
        `${greeting} ${name || 'Champion'} ! 💪 Construisons du muscle ensemble !`,
        `${greeting} ${name || 'Champion'} ! 🏋️ Chaque rep vous rend plus fort !`,
        `${greeting} ${name || 'Champion'} ! 🔥 Votre force grandit chaque jour !`
      ],
      'Performance': [
        `${greeting} ${name || 'Champion'} ! ⚡ Dépassons vos limites aujourd'hui !`,
        `${greeting} ${name || 'Champion'} ! 🚀 Performance maximale en vue !`,
        `${greeting} ${name || 'Champion'} ! 🎯 Excellence et dépassement de soi !`
      ]
    };

    const goalMessages = messages[goal as keyof typeof messages] || messages['Performance'];
    return goalMessages[new Date().getDay() % goalMessages.length];
  };

  // Charger les données du programme du jour
  useEffect(() => {
    loadTodayData();
  }, [user]);

  const loadTodayData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Charger le programme utilisateur
      const userProgramDoc = await getDoc(doc(db, 'userPrograms', user.uid));
      
      if (userProgramDoc.exists()) {
        const programData = userProgramDoc.data();
        const workoutPlan = programData.workoutPlan || [];
        const nutritionPlan = programData.nutritionPlan || [];
        
        // Déterminer l'entraînement du jour
        const today = new Date();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayKey = dayNames[today.getDay()];
        
        const todaySession = workoutPlan.find((session: any) => session.dayKey === todayKey);
        setTodayWorkout(todaySession);
        
        // Simuler les stats nutritionnelles (en attendant l'implémentation complète)
        const todayNutrition = nutritionPlan.find((day: any) => day.dayKey === todayKey);
        if (todayNutrition) {
          setNutritionStats({
            // Utiliser les calories consommées du store Redux
            target: todayNutrition.totalCalories
          });
        }
      }
      
      // Simuler le dernier objectif ajouté (en attendant l'implémentation des objectifs)
      setLastGoal({
        title: 'Faire 20 pompes d\'affilée',
        progress: 75,
        category: 'fitness'
      });
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'Push': return ['#FF6B6B', '#FF8E8E'];
      case 'Pull': return ['#4ECDC4', '#44A08D'];
      case 'Legs': return ['#45B7D1', '#96C93D'];
      case 'Cardio': return ['#FFA726', '#FFB74D'];
      case 'Core': return ['#AB47BC', '#BA68C8'];
      default: return ['#6EC1E4', '#4A90E2'];
    }
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
      case 'Push': return '💪';
      case 'Pull': return '🏋️';
      case 'Legs': return '🦵';
      case 'Cardio': return '❤️';
      case 'Core': return '🔥';
      default: return '💪';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'nutrition': return '🥗';
      case 'wellness': return '🧘';
      default: return '🎯';
    }
  };

  const caloriesPercentage = Math.min((nutritionStats.consumed / nutritionStats.target) * 100, 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header avec message personnalisé */}
      <AppHeader
        title="Fitrah"
        rightComponent={<ProfileMenu />}
      />
      
      {/* Message de bienvenue */}
      <View style={styles.welcomeSection}>
        <LinearGradient
          colors={['rgba(110, 193, 228, 0.1)', 'rgba(255, 255, 255, 0.95)']}
          style={styles.greetingContainer}
        >
          <Text style={styles.greeting}>{getPersonalizedMessage()}</Text>
          <View style={styles.levelBadge}>
            <View style={styles.levelBadgeGlow} />
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Programme du jour */}
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <Calendar size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Programme du jour</Text>
        </View>
        
        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : todayWorkout ? (
          <TouchableOpacity 
            style={styles.workoutCard}
            onPress={() => router.push('/(tabs)/training')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={getWorkoutTypeColor(todayWorkout.type)}
              style={styles.workoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.workoutCardOverlay} />
              <View style={styles.workoutHeader}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutType}>
                    {getWorkoutTypeIcon(todayWorkout.type)} {todayWorkout.type}
                  </Text>
                  <Text style={styles.workoutName}>{todayWorkout.name}</Text>
                  <View style={styles.workoutMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color="#FFFFFF" />
                      <Text style={styles.metaText}>{todayWorkout.estimatedDuration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Target size={14} color="#FFFFFF" />
                      <Text style={styles.metaText}>{todayWorkout.exercises?.length || 0} exercices</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
                  <View style={styles.playButtonGlow} />
                  <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.restDayCard}>
            <LinearGradient
              colors={['rgba(248, 249, 250, 0.8)', 'rgba(255, 255, 255, 1)']}
              style={styles.restDayGradient}
            >
            <Text style={styles.restDayIcon}>🛌</Text>
            <Text style={styles.restDayTitle}>Jour de repos</Text>
            <Text style={styles.restDayText}>Profitez de cette journée pour récupérer !</Text>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Dernier objectif */}
      <View style={styles.goalSection}>
        <View style={styles.sectionHeader}>
          <Target size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Dernier objectif</Text>
        </View>
        
        {lastGoal && (
          <TouchableOpacity 
            style={styles.goalCard}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.9}
          >
            <View style={styles.goalCardShadow} />
            <View style={styles.goalHeader}>
              <View style={styles.goalInfo}>
                <View style={styles.goalTitleRow}>
                  <Text style={styles.goalIcon}>{getCategoryIcon(lastGoal.category)}</Text>
                  <Text style={styles.goalTitle}>{lastGoal.title}</Text>
                </View>
                <View style={styles.goalProgress}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressBarGlow} />
                    <View style={[styles.progressFill, { width: `${lastGoal.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{lastGoal.progress}%</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#6EC1E4" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Statistiques rapides */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Statistiques du jour</Text>
        </View>
        
        <View style={styles.statsGrid}>
          {/* Calories */}
          <View style={styles.statCard}>
            <View style={styles.statCardGlow} />
            <LinearGradient
              colors={['#FF6B6B', '#FF8E8E']}
              style={styles.statIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Zap size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{consumedCalories}</Text>
              <Text style={styles.statLabel}>/ {nutritionStats.target} cal</Text>
              <View style={styles.statProgress}>
                <View style={styles.statProgressGlow} />
                <View style={[styles.statProgressFill, { width: `${Math.min((consumedCalories / nutritionStats.target) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>

          {/* Poids actuel */}
          <View style={styles.statCard}>
            <View style={styles.statCardGlow} />
            <LinearGradient
              colors={['#28A745', '#20C997']}
              style={styles.statIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Scale size={20} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.statContent}>
                <Text style={styles.statValue}>{weight}</Text>
                <Text style={styles.statLabel}>kg</Text>
                <Text style={styles.statSmallText}>Poids actuel</Text>
              </View>
            </View>
            </View>
          </View>

      {/* Actions rapides */}
      <View style={styles.actionsSection}>
        <View style={styles.sectionHeader}>
          <Sparkles size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Actions rapides</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/training')}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonShadow} />
            <LinearGradient
              colors={['#6EC1E4', '#4A90E2']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="fitness-center" size={24} color="#FFFFFF" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Commencer l'entraînement</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {todayWorkout ? `${todayWorkout.type} • ${todayWorkout.estimatedDuration} min` : 'Voir le programme'}
                </Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/nutrition')}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonShadow} />
            <LinearGradient
              colors={['#28A745', '#20C997']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="restaurant" size={24} color="#FFFFFF" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Plan nutritionnel</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {consumedCalories}/{nutritionStats.target} calories
                </Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <View style={styles.actionButtonShadow} />
            <LinearGradient
              colors={['#9C27B0', '#BA68C8']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Award size={24} color="#FFFFFF" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Mes objectifs</Text>
                <Text style={styles.actionButtonSubtitle}>
                  Suivre mes progrès
                </Text>
              </View>
              <ChevronRight size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Citation motivationnelle */}
      <View style={styles.quoteSection}>
        <View style={styles.quoteShadow} />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 249, 250, 0.8)']}
          style={styles.quoteCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.quoteGlow} />
          <Sparkles size={24} color="#6EC1E4" />
          <Text style={styles.quoteText}>
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </Text>
          <Text style={styles.quoteAuthor}>- Winston Churchill</Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA'
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  greetingContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  greeting: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    lineHeight: 26,
    marginBottom: 8,
  },
  levelBadge: {
    position: 'relative',
    backgroundColor: 'rgba(110, 193, 228, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  levelBadgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.1)',
    borderRadius: 16,
  },
  levelText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    fontWeight: '600',
  },
  todaySection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginLeft: 8,
    fontWeight: '700',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  workoutCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    transform: [{ scale: 1 }],
  },
  workoutGradient: {
    padding: 20,
    position: 'relative',
  },
  workoutCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.95,
    marginBottom: 4,
    fontWeight: '600',
  },
  workoutName: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '800',
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#FFFFFF',
    opacity: 0.95,
    fontWeight: '500',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 27,
  },
  restDayCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  restDayGradient: {
    padding: 24,
    alignItems: 'center',
  },
  restDayIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  restDayTitle: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    fontWeight: '700',
  },
  restDayText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  goalSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  goalCardShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  goalTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    fontWeight: '600',
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(233, 236, 239, 0.8)',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EC1E4',
    borderRadius: 4,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
    minWidth: 35,
    fontWeight: '700',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderRadius: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 2,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginBottom: 6,
  },
  statProgress: {
    height: 4,
    backgroundColor: 'rgba(233, 236, 239, 0.6)',
    borderRadius: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  statProgressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 2,
  },
  statProgressFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 2,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  statBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
  },
  statSmallText: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginTop: 4,
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  actionButtonShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 16,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  actionButtonContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionButtonTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginBottom: 2,
    fontWeight: '700',
  },
  actionButtonSubtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  quoteSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: 'relative',
  },
  quoteShadow: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 30,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    borderRadius: 20,
  },
  quoteCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.1)',
  },
  quoteGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.05)',
    borderRadius: 24,
  },
  quoteText: {
    fontSize: 17,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 26,
    marginVertical: 16,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  quoteAuthor: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
    fontWeight: '600',
  },
});