import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Activity, Calendar, Award, TrendingUp, ChartBar as BarChart3, Target, Clock } from 'lucide-react-native';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AppHeader from '@/components/AppHeader';

interface Statistics {
  totalUsers: number;
  activeUsers: number;
  totalPrograms: number;
  totalExercises: number;
  totalRecipes: number;
  completedWorkouts: number;
  averageWorkoutTime: number;
  popularExercises: Array<{ name: string; count: number }>;
  usersByLevel: Array<{ level: string; count: number }>;
  usersByGoal: Array<{ goal: string; count: number }>;
}

export default function StatisticsAdmin() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistics>({
    totalUsers: 0,
    activeUsers: 0,
    totalPrograms: 0,
    totalExercises: 0,
    totalRecipes: 0,
    completedWorkouts: 0,
    averageWorkoutTime: 0,
    popularExercises: [],
    usersByLevel: [],
    usersByGoal: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques de base
      const [
        usersSnapshot,
        programsSnapshot,
        exercisesSnapshot,
        recipesSnapshot,
        workoutsSnapshot
      ] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'programs')),
        getDocs(collection(db, 'exercises')),
        getDocs(collection(db, 'recipes')),
        getDocs(collection(db, 'workouts'))
      ]);

      // Calculer les statistiques des utilisateurs
      const users = usersSnapshot.docs.map(doc => doc.data());
      const usersByLevel = users.reduce((acc: any, user: any) => {
        const level = user.level || 'Non défini';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

      const usersByGoal = users.reduce((acc: any, user: any) => {
        const goal = user.goal || 'Non défini';
        acc[goal] = (acc[goal] || 0) + 1;
        return acc;
      }, {});

      // Calculer les statistiques des entraînements
      const workouts = workoutsSnapshot.docs.map(doc => doc.data());
      const completedWorkouts = workouts.filter(w => w.completed).length;
      const totalWorkoutTime = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);
      const averageWorkoutTime = workouts.length > 0 ? totalWorkoutTime / workouts.length : 0;

      // Exercices populaires (simulation)
      const popularExercises = [
        { name: 'Pompes', count: 45 },
        { name: 'Squats', count: 38 },
        { name: 'Tractions', count: 32 },
        { name: 'Burpees', count: 28 },
        { name: 'Planche', count: 25 },
      ];

      setStats({
        totalUsers: usersSnapshot.size,
        activeUsers: Math.floor(usersSnapshot.size * 0.7), // Simulation
        totalPrograms: programsSnapshot.size,
        totalExercises: exercisesSnapshot.size,
        totalRecipes: recipesSnapshot.size,
        completedWorkouts,
        averageWorkoutTime: Math.round(averageWorkoutTime / 60000), // Convertir en minutes
        popularExercises,
        usersByLevel: Object.entries(usersByLevel).map(([level, count]) => ({ level, count: count as number })),
        usersByGoal: Object.entries(usersByGoal).map(([goal, count]) => ({ goal, count: count as number })),
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={color}
        style={styles.statIcon}
      >
        <Icon size={24} color="#FFFFFF" />
      </LinearGradient>
      
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Statistiques d'utilisation" 
        showBackButton={true}
        colors={['#9C27B0', '#BA68C8']}
      />

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des statistiques...</Text>
          </View>
        ) : (
          <>
            {/* Overview Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
              
              <View style={styles.statsGrid}>
                <StatCard
                  title="Utilisateurs"
                  value={stats.totalUsers}
                  icon={Users}
                  color={['#6EC1E4', '#4A90E2']}
                  subtitle={`${stats.activeUsers} actifs`}
                />
                
                <StatCard
                  title="Programmes"
                  value={stats.totalPrograms}
                  icon={Calendar}
                  color={['#FF6B6B', '#FF8E8E']}
                />
                
                <StatCard
                  title="Exercices"
                  value={stats.totalExercises}
                  icon={Activity}
                  color={['#28A745', '#20C997']}
                />
                
                <StatCard
                  title="Recettes"
                  value={stats.totalRecipes}
                  icon={Target}
                  color={['#FFC107', '#FFD54F']}
                />
              </View>
            </View>

            {/* Workout Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Entraînements</Text>
              
              <View style={styles.workoutStats}>
                <View style={styles.workoutStatCard}>
                  <View style={styles.workoutStatHeader}>
                    <Award size={24} color="#9C27B0" />
                    <Text style={styles.workoutStatTitle}>Séances terminées</Text>
                  </View>
                  <Text style={styles.workoutStatValue}>{stats.completedWorkouts}</Text>
                </View>
                
                <View style={styles.workoutStatCard}>
                  <View style={styles.workoutStatHeader}>
                    <Clock size={24} color="#9C27B0" />
                    <Text style={styles.workoutStatTitle}>Temps moyen</Text>
                  </View>
                  <Text style={styles.workoutStatValue}>{stats.averageWorkoutTime} min</Text>
                </View>
              </View>
            </View>

            {/* Popular Exercises */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Exercices populaires</Text>
              
              <View style={styles.popularExercises}>
                {stats.popularExercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <View style={styles.exerciseRank}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <View style={styles.exerciseBar}>
                        <View 
                          style={[
                            styles.exerciseBarFill, 
                            { width: `${(exercise.count / stats.popularExercises[0].count) * 100}%` }
                          ]} 
                        />
                      </View>
                    </View>
                    
                    <Text style={styles.exerciseCount}>{exercise.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* User Demographics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Répartition des utilisateurs</Text>
              
              <View style={styles.demographics}>
                <View style={styles.demographicCard}>
                  <Text style={styles.demographicTitle}>Par niveau</Text>
                  {stats.usersByLevel.map((item, index) => (
                    <View key={index} style={styles.demographicItem}>
                      <Text style={styles.demographicLabel}>{item.level}</Text>
                      <View style={styles.demographicBar}>
                        <View 
                          style={[
                            styles.demographicBarFill, 
                            { width: `${(item.count / stats.totalUsers) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.demographicCount}>{item.count}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.demographicCard}>
                  <Text style={styles.demographicTitle}>Par objectif</Text>
                  {stats.usersByGoal.map((item, index) => (
                    <View key={index} style={styles.demographicItem}>
                      <Text style={styles.demographicLabel}>{item.goal}</Text>
                      <View style={styles.demographicBar}>
                        <View 
                          style={[
                            styles.demographicBarFill, 
                            { width: `${(item.count / stats.totalUsers) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.demographicCount}>{item.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Growth Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Métriques de croissance</Text>
              
              <View style={styles.growthCard}>
                <View style={styles.growthHeader}>
                  <TrendingUp size={24} color="#28A745" />
                  <Text style={styles.growthTitle}>Tendances</Text>
                </View>
                
                <View style={styles.growthMetrics}>
                  <View style={styles.growthMetric}>
                    <Text style={styles.growthLabel}>Nouveaux utilisateurs (7j)</Text>
                    <Text style={styles.growthValue}>+12</Text>
                    <Text style={styles.growthChange}>+15%</Text>
                  </View>
                  
                  <View style={styles.growthMetric}>
                    <Text style={styles.growthLabel}>Séances complétées (7j)</Text>
                    <Text style={styles.growthValue}>+89</Text>
                    <Text style={styles.growthChange}>+23%</Text>
                  </View>
                  
                  <View style={styles.growthMetric}>
                    <Text style={styles.growthLabel}>Taux de rétention</Text>
                    <Text style={styles.growthValue}>68%</Text>
                    <Text style={styles.growthChange}>+5%</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  section: {
    marginBottom: 32,
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
    gap: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666666',
  },
  statSubtitle: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutStatTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginLeft: 12,
  },
  workoutStatValue: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#9C27B0',
    textAlign: 'center',
  },
  popularExercises: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  exerciseBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
  },
  exerciseBarFill: {
    height: '100%',
    backgroundColor: '#9C27B0',
    borderRadius: 3,
  },
  exerciseCount: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#9C27B0',
  },
  demographics: {
    gap: 16,
  },
  demographicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demographicTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  demographicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demographicLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
    width: 100,
  },
  demographicBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    marginHorizontal: 12,
  },
  demographicBarFill: {
    height: '100%',
    backgroundColor: '#6EC1E4',
    borderRadius: 3,
  },
  demographicCount: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    width: 30,
    textAlign: 'right',
  },
  growthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  growthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  growthTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginLeft: 12,
  },
  growthMetrics: {
    gap: 16,
  },
  growthMetric: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  growthLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    flex: 1,
  },
  growthValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginRight: 16,
  },
  growthChange: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
  },
});