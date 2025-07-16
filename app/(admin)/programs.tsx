import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, Trash2, X, Calendar, Target, Users, Eye, User, Plus, Minus } from 'lucide-react-native';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AppHeader from '@/components/AppHeader';

interface WorkoutProgram {
  id?: string;
  name: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goal: 'Perte de poids' | 'Prise de muscle' | 'Performance';
  daysPerWeek: number;
  duration?: number;
  type?: 'user_generated' | 'admin_created';
  isUserGenerated?: boolean;
  originalUserId?: string;
  createdBy?: string;
  visibility?: string;
  preferences?: any;
  workoutPlan?: any[];
  nutritionPlan?: any[];
  createdAt?: any;
  updatedAt?: any;
}

interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  equipment: string;
  sets: number;
  reps: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  diet: string;
  goal: string;
  mealType: string;
}

interface UserInfo {
  name: string;
  email: string;
}

export default function ProgramsAdmin() {
  const router = useRouter();
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [userInfos, setUserInfos] = useState<Record<string, UserInfo>>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrograms();
    loadAvailableData();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      console.log('📖 Chargement des programmes admin...');
      
      // Charger tous les programmes utilisateurs depuis userPrograms
      const userProgramsRef = collection(db, 'userPrograms');
      const querySnapshot = await getDocs(userProgramsRef);
      
      console.log('📊 Nombre de programmes trouvés:', querySnapshot.size);
      
      const programsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutProgram[];
      
      // Trier par date de création (plus récents en premier)
      programsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('✅ Programmes chargés:', programsData.length);
      setPrograms(programsData);
      
      // Charger les informations utilisateurs
      await loadUserInfos(programsData);
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des programmes:', error);
      console.error('❌ Code d\'erreur:', error.code);
      console.error('❌ Message:', error.message);
      
      let errorMessage = 'Impossible de charger les programmes';
      if (error.code === 'permission-denied') {
        errorMessage = 'Permissions insuffisantes. Vérifiez vos droits d\'accès.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporairement indisponible. Réessayez plus tard.';
      }
      
      Alert.alert('Erreur de chargement', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfos = async (programs: WorkoutProgram[]) => {
    try {
      const userIds = [...new Set(programs.map(p => p.originalUserId || p.userId).filter(Boolean))];
      const userInfosMap: Record<string, UserInfo> = {};
      
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userInfosMap[userId] = {
              name: userData.name || userData.displayName || 'Utilisateur inconnu',
              email: userData.email || 'Email non disponible'
            };
          }
        } catch (error) {
          console.warn(`Impossible de charger les infos pour l'utilisateur ${userId}`);
          userInfosMap[userId] = {
            name: 'Utilisateur inconnu',
            email: 'Email non disponible'
          };
        }
      }
      
      setUserInfos(userInfosMap);
    } catch (error) {
      console.error('Erreur lors du chargement des infos utilisateurs:', error);
    }
  };

  const loadAvailableData = async () => {
    try {
      // Charger les exercices disponibles
      const exercisesQuery = query(collection(db, 'exercises'), orderBy('name'));
      const exercisesSnapshot = await getDocs(exercisesQuery);
      const exercisesData = exercisesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];
      setAvailableExercises(exercisesData);

      // Charger les recettes disponibles
      const recipesQuery = query(collection(db, 'recipes'), orderBy('name'));
      const recipesSnapshot = await getDocs(recipesQuery);
      const recipesData = recipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setAvailableRecipes(recipesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer ce programme ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Suppression du programme:', programId);
              await deleteDoc(doc(db, 'userPrograms', programId));
              console.log('✅ Programme supprimé avec succès');
              Alert.alert('Succès', 'Programme supprimé avec succès');
              loadPrograms();
            } catch (error: any) {
              console.error('❌ Erreur lors de la suppression:', error);
              console.error('❌ Code d\'erreur:', error.code);
              
              let errorMessage = 'Impossible de supprimer le programme';
              if (error.code === 'permission-denied') {
                errorMessage = 'Permissions insuffisantes pour supprimer.';
              }
              
              Alert.alert('Erreur de suppression', errorMessage);
            }
          }
        }
      ]
    );
  };

  const handleViewProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    setIsModalVisible(true);
  };

  const handleEditProgram = (program: WorkoutProgram) => {
    setEditingProgram({ ...program });
    setIsEditModalVisible(true);
  };

  const handleSaveProgram = async () => {
    if (!editingProgram) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'userPrograms', editingProgram.id!), {
        ...editingProgram,
        updatedAt: new Date()
      });
      
      Alert.alert('Succès', 'Programme mis à jour avec succès');
      setIsEditModalVisible(false);
      setEditingProgram(null);
      loadPrograms();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le programme');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceExercise = (sessionIndex: number, exerciseIndex: number, newExercise: Exercise) => {
    if (!editingProgram) return;

    const updatedProgram = { ...editingProgram };
    updatedProgram.workoutPlan[sessionIndex].exercises[exerciseIndex] = {
      exerciseId: newExercise.id,
      name: newExercise.name,
      sets: newExercise.sets || 3,
      reps: newExercise.reps || '8-12',
      restTime: 90,
      category: newExercise.category,
      level: newExercise.level,
      equipment: newExercise.equipment,
      description: newExercise.description
    };

    setEditingProgram(updatedProgram);
  };

  const handleRemoveExercise = (sessionIndex: number, exerciseIndex: number) => {
    if (!editingProgram) return;

    const updatedProgram = { ...editingProgram };
    updatedProgram.workoutPlan[sessionIndex].exercises.splice(exerciseIndex, 1);
    setEditingProgram(updatedProgram);
  };

  const handleAddExercise = (sessionIndex: number, exercise: Exercise) => {
    if (!editingProgram) return;

    const updatedProgram = { ...editingProgram };
    updatedProgram.workoutPlan[sessionIndex].exercises.push({
      exerciseId: exercise.id,
      name: exercise.name,
      sets: exercise.sets || 3,
      reps: exercise.reps || '8-12',
      restTime: 90,
      category: exercise.category,
      level: exercise.level,
      equipment: exercise.equipment,
      description: exercise.description
    });

    setEditingProgram(updatedProgram);
  };

  const handleReplaceRecipe = (dayIndex: number, mealIndex: number, newRecipe: Recipe) => {
    if (!editingProgram) return;

    const updatedProgram = { ...editingProgram };
    updatedProgram.nutritionPlan[dayIndex].meals[mealIndex] = {
      recipeId: newRecipe.id,
      name: newRecipe.name,
      type: newRecipe.mealType as any,
      calories: newRecipe.calories,
      protein: newRecipe.protein,
      carbs: newRecipe.carbs,
      fat: newRecipe.fat,
      ingredients: newRecipe.ingredients,
      cookTime: newRecipe.cookTime
    };

    // Recalculer les totaux du jour
    const day = updatedProgram.nutritionPlan[dayIndex];
    day.totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
    day.totalProtein = day.meals.reduce((sum, meal) => sum + meal.protein, 0);
    day.totalCarbs = day.meals.reduce((sum, meal) => sum + meal.carbs, 0);
    day.totalFat = day.meals.reduce((sum, meal) => sum + meal.fat, 0);

    setEditingProgram(updatedProgram);
  };

  const handleRemoveRecipe = (dayIndex: number, mealIndex: number) => {
    if (!editingProgram) return;

    const updatedProgram = { ...editingProgram };
    updatedProgram.nutritionPlan[dayIndex].meals.splice(mealIndex, 1);
    
    // Recalculer les totaux du jour
    const day = updatedProgram.nutritionPlan[dayIndex];
    day.totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
    day.totalProtein = day.meals.reduce((sum, meal) => sum + meal.protein, 0);
    day.totalCarbs = day.meals.reduce((sum, meal) => sum + meal.carbs, 0);
    day.totalFat = day.meals.reduce((sum, meal) => sum + meal.fat, 0);

    setEditingProgram(updatedProgram);
  };

  const formatDate = (date: any) => {
    if (!date) return 'Date inconnue';
    
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Date invalide';
    }
  };

  const getProgramTypeInfo = (program: WorkoutProgram) => {
    const userId = program.originalUserId || program.userId;
    return userInfos[userId] || { name: 'Utilisateur inconnu', email: 'Email non disponible' };
  };

  const getUserInfo = (program: WorkoutProgram) => {
    if (program.type === 'user_generated' || program.isUserGenerated) {
      return {
        label: 'Utilisateur',
        icon: User,
        color: '#6EC1E4',
        bgColor: '#E8F6FD'
      };
    } else {
      return {
        label: 'Admin',
        icon: Users,
        color: '#9C27B0',
        bgColor: '#F3E5F5'
      };
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'Perte de poids':
        return '#FF6B6B';
      case 'Prise de muscle':
        return '#28A745';
      case 'Performance':
        return '#6EC1E4';
      default:
        return '#666666';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant':
        return '#28A745';
      case 'Intermédiaire':
        return '#FFA726';
      case 'Avancé':
        return '#DC3545';
      default:
        return '#666666';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Programmes Utilisateurs" 
        showBackButton={true}
        colors={['#FF6B6B', '#FF8E8E']}
      />

      {/* Programs List */}
      <ScrollView style={styles.content}>
        {loading && programs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : programs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color="#CED4DA" />
            <Text style={styles.emptyText}>Aucun programme trouvé</Text>
            <Text style={styles.emptySubtext}>
              Les programmes générés par les utilisateurs apparaîtront ici
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <Text style={styles.statsTitle}>📊 Statistiques</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{programs.length}</Text>
                  <Text style={styles.statLabel}>Total programmes</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {programs.filter(p => p.type === 'user_generated' || p.isUserGenerated).length}
                  </Text>
                  <Text style={styles.statLabel}>Générés par utilisateurs</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {programs.filter(p => p.level === 'Débutant').length}
                  </Text>
                  <Text style={styles.statLabel}>Niveau débutant</Text>
                </View>
              </View>
            </View>

            {programs.map((program) => {
              const typeInfo = getProgramTypeInfo(program);
              const userInfo = getUserInfo(program);
              
              return (
                <View key={program.id} style={styles.programCard}>
                  <View style={styles.programHeader}>
                    <View style={styles.programInfo}>
                      <View style={styles.programTitleRow}>
                        <Text style={styles.programName}>{program.name}</Text>
                        <View style={[styles.typeTag, { backgroundColor: userInfo.bgColor }]}>
                          <userInfo.icon size={12} color={userInfo.color} />
                          <Text style={[styles.typeTagText, { color: userInfo.color }]}>
                            {userInfo.label}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.programDescription} numberOfLines={2}>
                        {program.description}
                      </Text>
                      <View style={styles.userInfoContainer}>
                        <Text style={styles.userName}>👤 {typeInfo.name}</Text>
                        <Text style={styles.userEmail}>📧 {typeInfo.email}</Text>
                      </View>
                      <Text style={styles.programDate}>
                        Créé le {formatDate(program.createdAt)}
                      </Text>
                    </View>
                    
                    <View style={styles.programActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditProgram(program)}
                      >
                        <Edit size={20} color="#28A745" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleViewProgram(program)}
                      >
                        <Eye size={20} color="#6EC1E4" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteProgram(program.id!)}
                      >
                        <Trash2 size={20} color="#DC3545" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.programStats}>
                    <View style={styles.statItem}>
                      <Target size={16} color={getGoalColor(program.goal)} />
                      <Text style={[styles.statText, { color: getGoalColor(program.goal) }]}>
                        {program.goal}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Users size={16} color={getLevelColor(program.level)} />
                      <Text style={[styles.statText, { color: getLevelColor(program.level) }]}>
                        {program.level}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Calendar size={16} color="#666666" />
                      <Text style={styles.statText}>{program.daysPerWeek}j/sem</Text>
                    </View>
                  </View>
                  
                  <View style={styles.programDetails}>
                    <Text style={styles.sessionCount}>
                      {program.workoutPlan?.length || 0} séance{(program.workoutPlan?.length || 0) > 1 ? 's' : ''}
                    </Text>
                    <Text style={styles.exerciseCount}>
                      {program.nutritionPlan?.length || 0} jour{(program.nutritionPlan?.length || 0) > 1 ? 's' : ''} nutrition
                    </Text>
                    {program.originalUserId && (
                      <Text style={styles.userIdText}>
                        ID: {program.originalUserId.substring(0, 8)}...
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Modal de visualisation */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsModalVisible(false)}
            >
              <X size={24} color="#333333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Détails du programme</Text>
            
            <View style={styles.placeholder} />
          </View>
          
          {selectedProgram && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Informations générales</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nom :</Text>
                  <Text style={styles.detailValue}>{selectedProgram.name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description :</Text>
                  <Text style={styles.detailValue}>{selectedProgram.description}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Niveau :</Text>
                  <Text style={[styles.detailValue, { color: getLevelColor(selectedProgram.level) }]}>
                    {selectedProgram.level}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Objectif :</Text>
                  <Text style={[styles.detailValue, { color: getGoalColor(selectedProgram.goal) }]}>
                    {selectedProgram.goal}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fréquence :</Text>
                  <Text style={styles.detailValue}>{selectedProgram.daysPerWeek} jours/semaine</Text>
                </View>
              </View>

              {selectedProgram.preferences && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Préférences utilisateur</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Régime :</Text>
                    <Text style={styles.detailValue}>{selectedProgram.preferences.diet}</Text>
                  </View>
                  {selectedProgram.preferences.selectedDays && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Jours sélectionnés :</Text>
                      <Text style={styles.detailValue}>
                        {selectedProgram.preferences.selectedDays.length} jours
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {selectedProgram.workoutPlan && selectedProgram.workoutPlan.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Plan d'entraînement</Text>
                  {selectedProgram.workoutPlan.map((session: any, index: number) => (
                    <View key={index} style={styles.sessionCard}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <Text style={styles.sessionDetails}>
                        {session.exercises?.length || 0} exercices • {session.estimatedDuration || 0} min
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedProgram.nutritionPlan && selectedProgram.nutritionPlan.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Plan nutritionnel</Text>
                  {selectedProgram.nutritionPlan.map((day: any, index: number) => (
                    <View key={index} style={styles.nutritionCard}>
                      <Text style={styles.nutritionDay}>{day.day}</Text>
                      <Text style={styles.nutritionDetails}>
                        {day.meals?.length || 0} repas • {day.totalCalories || 0} cal
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Métadonnées</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type :</Text>
                  <Text style={styles.detailValue}>
                    {selectedProgram.type === 'user_generated' || selectedProgram.isUserGenerated ? 'Généré par utilisateur' : 'Créé par admin'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Créé le :</Text>
                  <Text style={styles.detailValue}>{formatDate(selectedProgram.createdAt)}</Text>
                </View>
                {selectedProgram.originalUserId && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID Utilisateur :</Text>
                    <Text style={styles.detailValue}>{selectedProgram.originalUserId}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Modal d'édition */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <X size={24} color="#333333" />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Modifier le programme</Text>
            
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveProgram}
              disabled={loading}
            >
              <Text style={[styles.saveButtonText, loading && styles.saveButtonDisabled]}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {editingProgram && (
            <ScrollView style={styles.modalContent}>
              {/* Informations utilisateur */}
              <View style={styles.editSection}>
                <Text style={styles.editSectionTitle}>Utilisateur</Text>
                <View style={styles.userInfoCard}>
                  <Text style={styles.editUserName}>{getProgramTypeInfo(editingProgram).name}</Text>
                  <Text style={styles.editUserEmail}>{getProgramTypeInfo(editingProgram).email}</Text>
                </View>
              </View>

              {/* Plan d'entraînement */}
              <View style={styles.editSection}>
                <Text style={styles.editSectionTitle}>Plan d'entraînement</Text>
                {editingProgram.workoutPlan?.map((session: any, sessionIndex: number) => (
                  <View key={sessionIndex} style={styles.editSessionCard}>
                    <Text style={styles.editSessionName}>{session.name}</Text>
                    
                    {session.exercises?.map((exercise: any, exerciseIndex: number) => (
                      <View key={exerciseIndex} style={styles.editExerciseItem}>
                        <View style={styles.editExerciseInfo}>
                          <Text style={styles.editExerciseName}>{exercise.name}</Text>
                          <Text style={styles.editExerciseDetails}>
                            {exercise.sets} séries × {exercise.reps}
                          </Text>
                        </View>
                        
                        <View style={styles.editExerciseActions}>
                          <TouchableOpacity
                            style={styles.editActionButton}
                            onPress={() => {
                              Alert.alert(
                                'Remplacer l\'exercice',
                                'Choisissez un nouvel exercice',
                                availableExercises.map(ex => ({
                                  text: ex.name,
                                  onPress: () => handleReplaceExercise(sessionIndex, exerciseIndex, ex)
                                })).concat([{ text: 'Annuler', style: 'cancel' }])
                              );
                            }}
                          >
                            <Edit size={16} color="#6EC1E4" />
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.editActionButton}
                            onPress={() => handleRemoveExercise(sessionIndex, exerciseIndex)}
                          >
                            <Minus size={16} color="#DC3545" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                    
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => {
                        Alert.alert(
                          'Ajouter un exercice',
                          'Choisissez un exercice à ajouter',
                          availableExercises.map(ex => ({
                            text: ex.name,
                            onPress: () => handleAddExercise(sessionIndex, ex)
                          })).concat([{ text: 'Annuler', style: 'cancel' }])
                        );
                      }}
                    >
                      <Plus size={16} color="#28A745" />
                      <Text style={styles.addButtonText}>Ajouter un exercice</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {/* Plan nutritionnel */}
              <View style={styles.editSection}>
                <Text style={styles.editSectionTitle}>Plan nutritionnel</Text>
                {editingProgram.nutritionPlan?.map((day: any, dayIndex: number) => (
                  <View key={dayIndex} style={styles.editDayCard}>
                    <Text style={styles.editDayName}>{day.day}</Text>
                    <Text style={styles.editDayCalories}>{day.totalCalories} calories</Text>
                    
                    {day.meals?.map((meal: any, mealIndex: number) => (
                      <View key={mealIndex} style={styles.editMealItem}>
                        <View style={styles.editMealInfo}>
                          <Text style={styles.editMealName}>{meal.name}</Text>
                          <Text style={styles.editMealType}>{meal.type}</Text>
                          <Text style={styles.editMealCalories}>{meal.calories} cal</Text>
                        </View>
                        
                        <View style={styles.editMealActions}>
                          <TouchableOpacity
                            style={styles.editActionButton}
                            onPress={() => {
                              const compatibleRecipes = availableRecipes.filter(
                                recipe => recipe.mealType === meal.type
                              );
                              Alert.alert(
                                'Remplacer la recette',
                                'Choisissez une nouvelle recette',
                                compatibleRecipes.map(recipe => ({
                                  text: recipe.name,
                                  onPress: () => handleReplaceRecipe(dayIndex, mealIndex, recipe)
                                })).concat([{ text: 'Annuler', style: 'cancel' }])
                              );
                            }}
                          >
                            <Edit size={16} color="#6EC1E4" />
                          </TouchableOpacity>
                          
                          <TouchableOpacity
                            style={styles.editActionButton}
                            onPress={() => handleRemoveRecipe(dayIndex, mealIndex)}
                          >
                            <Minus size={16} color="#DC3545" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  programCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programInfo: {
    flex: 1,
    marginRight: 16,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  programName: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeTagText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
  },
  programDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  userInfoContainer: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  userName: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  programDate: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  programActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  programStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
  },
  programDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionCount: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#FF6B6B',
  },
  exerciseCount: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
  userIdText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#333333',
    flex: 1,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  sessionDetails: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  nutritionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  nutritionDay: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  nutritionDetails: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  editSection: {
    marginBottom: 24,
  },
  editSectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 16,
  },
  userInfoCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  editUserName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  editUserEmail: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  editSessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  editSessionName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  editExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  editExerciseInfo: {
    flex: 1,
  },
  editExerciseName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
  },
  editExerciseDetails: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  editExerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F8F9FA',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#28A745',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
    marginLeft: 8,
  },
  editDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  editDayName: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  editDayCalories: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
    marginBottom: 12,
  },
  editMealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  editMealInfo: {
    flex: 1,
  },
  editMealName: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
  },
  editMealType: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  editMealCalories: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
  },
  editMealActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
  },
  saveButtonDisabled: {
    color: '#CCCCCC',
  },
});