import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '@/store/store';
import { toggleExerciseCompletion, startWorkout, endWorkout } from '@/store/slices/workoutSlice';
import { Play, Pause, CircleCheck as CheckCircle, Circle, Timer, Video } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AppHeader from '@/components/AppHeader';

interface WorkoutSession {
  day: string;
  dayKey: string;
  name: string;
  type: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Core';
  exercises: ProgramExercise[];
  estimatedDuration: number;
}

interface ProgramExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  restTime: number;
  category: string;
  level: string;
  equipment: string;
  description: string;
  completed?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi', short: 'L' },
  { key: 'tuesday', label: 'Mardi', short: 'M' },
  { key: 'wednesday', label: 'Mercredi', short: 'M' },
  { key: 'thursday', label: 'Jeudi', short: 'J' },
  { key: 'friday', label: 'Vendredi', short: 'V' },
  { key: 'saturday', label: 'Samedi', short: 'S' },
  { key: 'sunday', label: 'Dimanche', short: 'D' },
];

export default function TrainingScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { isWorkoutActive } = useSelector((state: RootState) => state.workout);
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserProgram();
  }, [user]);

  // Recharger le programme quand on revient sur cette page
  useEffect(() => {
    const unsubscribe = router.addListener?.('focus', () => {
      console.log('🔄 Page training refocused, rechargement du programme');
      loadUserProgram();
    });

    return unsubscribe;
  }, [router]);
  const loadUserProgram = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('📖 Chargement du programme utilisateur...');
      
      const userProgramDoc = await getDoc(doc(db, 'userPrograms', user.uid));
      
      if (userProgramDoc.exists()) {
        const programData = userProgramDoc.data();
        const workoutPlan = programData.workoutPlan || [];
        
        console.log('✅ Programme chargé:', workoutPlan.length, 'séances');
        setWorkoutPlan(workoutPlan);
        
        // Sélectionner automatiquement la première séance
        if (workoutPlan.length > 0) {
          setSelectedSession(workoutPlan[0]);
        }
      } else {
        console.log('❌ Aucun programme trouvé pour l\'utilisateur');
        setWorkoutPlan([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du programme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
    
    dispatch(toggleExerciseCompletion(exerciseId));
  };

  const handleWorkoutToggle = () => {
    if (isWorkoutActive) {
      dispatch(endWorkout());
    } else {
      dispatch(startWorkout());
    }
  };

  const handleSessionSelect = (session: WorkoutSession) => {
    setSelectedSession(session);
    // Réinitialiser les exercices complétés pour la nouvelle séance
    setCompletedExercises(new Set());
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'Push':
        return ['#FF6B6B', '#FF8E8E'];
      case 'Pull':
        return ['#4ECDC4', '#44A08D'];
      case 'Legs':
        return ['#45B7D1', '#96C93D'];
      case 'Cardio':
        return ['#FFA726', '#FFB74D'];
      case 'Core':
        return ['#AB47BC', '#BA68C8'];
      default:
        return ['#6EC1E4', '#4A90E2'];
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'Push':
        return '💪';
      case 'Pull':
        return '🏋️';
      case 'Legs':
        return '🦵';
      case 'Cardio':
        return '❤️';
      case 'Core':
        return '🔥';
      default:
        return '💪';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de votre programme...</Text>
      </View>
    );
  }

  if (workoutPlan.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Calendar size={48} color="#CED4DA" />
        <Text style={styles.emptyText}>Aucun programme trouvé</Text>
        <Text style={styles.emptySubtext}>
          Veuillez créer votre programme personnalisé
        </Text>
      </View>
    );
  }

  const completedCount = selectedSession ? 
    selectedSession.exercises.filter(ex => completedExercises.has(ex.exerciseId)).length : 0;
  const totalCount = selectedSession?.exercises.length || 0;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <ScrollView style={styles.container}>
      <AppHeader 
        title="Entraînement 🏋️‍♂️" 
        subtitle={selectedSession ? `${getSessionTypeIcon(selectedSession.type)} ${selectedSession.name}` : undefined}
      />
      
      {/* Progress Summary */}
      {selectedSession && (
        <View style={styles.progressSummary}>
          <View style={styles.progressSummaryGlow} />
          <Text style={styles.progressText}>
            {completedCount} / {totalCount} exercices
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBarGlow} />
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      )}

      {/* Sessions Selection */}
      <View style={styles.sessionsSection}>
        <Text style={styles.sectionTitle}>Vos séances</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sessionsScroll} contentContainerStyle={styles.sessionsContainer}>
          {workoutPlan.map((session, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sessionCard,
                selectedSession?.dayKey === session.dayKey && styles.sessionCardActive
              ]}
              onPress={() => handleSessionSelect(session)}
              activeOpacity={0.8}
            >
              <View style={styles.sessionCardShadow} />
              <LinearGradient
                colors={getSessionTypeColor(session.type)}
                style={styles.sessionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.sessionOverlay} />
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionDay}>{session.day}</Text>
                  <Text style={styles.sessionType}>
                    {getSessionTypeIcon(session.type)} {session.type}
                  </Text>
                </View>
                <View style={styles.sessionDetails}>
                  <Text style={styles.sessionDuration}>
                    {session.estimatedDuration} min
                  </Text>
                  <Text style={styles.sessionExercises}>
                    {session.exercises.length} exercices
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedSession && (
        <> 
          {/* Exercise List */}
          <View style={styles.exerciseSection}>
            <Text style={styles.sectionTitle}>Exercices</Text>
            {selectedSession.exercises.map((exercise, index) => (
              <View key={exercise.exerciseId} style={styles.exerciseCard}>
                <View style={styles.exerciseCardGlow} />
                <View style={styles.exerciseHeader}>
                  <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => handleToggleExercise(exercise.exerciseId)}
                    activeOpacity={0.7}
                  >
                    {completedExercises.has(exercise.exerciseId) ? (
                      <CheckCircle size={24} color="#28A745" />
                    ) : (
                      <Circle size={24} color="#CED4DA" />
                    )}
                  </TouchableOpacity>
                  
                  <View style={styles.exerciseInfo}>
                    <Text style={[
                      styles.exerciseName,
                      completedExercises.has(exercise.exerciseId) && styles.exerciseNameCompleted
                    ]}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.exerciseReps}>
                      {exercise.sets} séries × {exercise.reps} répétitions
                    </Text>
                    <Text style={styles.exerciseDescription}>
                      {exercise.description}
                    </Text>
                    <View style={styles.exerciseMeta}>
                      <Text style={styles.exerciseEquipment}>
                        📦 {exercise.equipment}
                      </Text>
                      <Text style={styles.exerciseRest}>
                        ⏱️ {exercise.restTime}s repos
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.exerciseActions}>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Timer size={20} color="#6EC1E4" />
                    <Text style={styles.actionButtonText}>Timer</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Video size={20} color="#6EC1E4" />
                    <Text style={styles.actionButtonText}>Vidéo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Rest Timer Info */}
      <View style={styles.timerInfo}>
        <View style={styles.timerInfoGlow} />
        <Text style={styles.timerInfoTitle}>⏱️ Timer de repos</Text>
        <Text style={styles.timerInfoText}>
          Le timer se lance automatiquement entre les séries. Vous pouvez aussi utiliser l'onglet Minuteur.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 40,
  },
  emptyText: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666666',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressSummary: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressSummaryGlow: {
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
  progressText: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
    marginBottom: 6,
    fontWeight: '700',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(233, 236, 239, 0.6)',
    borderRadius: 3,
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
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EC1E4',
    borderRadius: 3,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  sessionsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 16,
    fontWeight: '800',
  },
  sessionsContainer: {
    paddingHorizontal: 4,
  },
  sessionsScroll: {
    flexDirection: 'row',
  },
  sessionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sessionCard: {
    width: 160,
    minWidth: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  sessionCardShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 16,
  },
  sessionCardActive: {
    transform: [{ scale: 1.02 }],
  },
  sessionGradient: {
    padding: 20,
    minHeight: 120,
    justifyContent: 'space-between',
    position: 'relative',
  },
  sessionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sessionHeader: {
    marginBottom: 12,
  },
  sessionDay: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    marginBottom: 6,
    fontWeight: '800',
  },
  sessionType: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    opacity: 0.98,
    fontWeight: '600',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  sessionExercises: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  exerciseSection: {
    padding: 20,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  exerciseCardGlow: {
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
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkButton: {
    marginRight: 16,
    marginTop: 2,
    padding: 4,
    borderRadius: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
    fontWeight: '700',
  },
  exerciseNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  exerciseReps: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    marginBottom: 4,
    fontWeight: '600',
  },
  exerciseDescription: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 22,
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseEquipment: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  exerciseRest: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  exerciseActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(233, 236, 239, 0.6)',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(110, 193, 228, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.2)',
  },
  actionButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    marginLeft: 8,
    fontWeight: '600',
  },
  timerInfo: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(110, 193, 228, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  timerInfoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.05)',
    borderRadius: 16,
  },
  timerInfoTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    fontWeight: '700',
  },
  timerInfoText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 22,
  },
});