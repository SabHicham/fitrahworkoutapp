import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, CreditCard as Edit, Trash2, Save, X, Dumbbell, Video, Tag } from 'lucide-react-native';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import VideoUploader from '@/components/VideoUploader';
import { dataSeedingService } from '@/services/dataSeedingService';
import AppHeader from '@/components/AppHeader';

interface Exercise {
  id?: string;
  name: string;
  description: string;
  videoUrl: string;
  category: 'Push' | 'Pull' | 'Legs' | 'Cardio' | 'Core';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  equipment: 'Poids du corps' | 'Haltères' | 'Barre' | 'Machine' | 'Élastiques';
  muscleGroups: string[];
  sets: number;
  reps: string;
}

export default function ExercisesAdmin() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  const [formData, setFormData] = useState<Exercise>({
    name: '',
    description: '',
    videoUrl: '',
    category: 'Push',
    level: 'Débutant',
    equipment: 'Poids du corps',
    muscleGroups: [],
    sets: 3,
    reps: '8-12',
  });

  useEffect(() => {
    loadExercises();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await dataSeedingService.seedDatabase();
      if (result.success) {
        Alert.alert(
          'Succès',
          `Exercices: ${result.results.exercises.message}\nRecettes: ${result.results.recipes.message}`
        );
        loadExercises();
      } else {
        Alert.alert('Erreur', 'Impossible de peupler la base de données');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSeeding(false);
    }
  };

  const loadExercises = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'exercises'));
      const exercisesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];
      setExercises(exercisesData);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Erreur', 'Impossible de charger les exercices');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExercise = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      if (editingExercise?.id) {
        // Mise à jour
        await updateDoc(doc(db, 'exercises', editingExercise.id), formData);
        Alert.alert('Succès', 'Exercice mis à jour avec succès');
      } else {
        // Création
        await addDoc(collection(db, 'exercises'), formData);
        Alert.alert('Succès', 'Exercice créé avec succès');
      }
      
      setIsModalVisible(false);
      setEditingExercise(null);
      resetForm();
      loadExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'exercice');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet exercice ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'exercises', exerciseId));
              Alert.alert('Succès', 'Exercice supprimé avec succès');
              loadExercises();
            } catch (error) {
              console.error('Error deleting exercise:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'exercice');
            }
          }
        }
      ]
    );
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData(exercise);
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingExercise(null);
    resetForm();
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      videoUrl: '',
      category: 'Push',
      level: 'Débutant',
      equipment: 'Poids du corps',
      muscleGroups: [],
      sets: 3,
      reps: '8-12',
    });
  };

  const categories = ['Push', 'Pull', 'Legs', 'Cardio', 'Core'];
  const levels = ['Débutant', 'Intermédiaire', 'Avancé'];
  const equipments = ['Poids du corps', 'Haltères', 'Barre', 'Machine', 'Élastiques'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Gestion des Exercices" 
        showBackButton={true}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={openCreateModal}
              disabled={seeding}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {exercises.length === 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleSeedData}
                disabled={seeding}
              >
                <Tag size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Exercises List */}
      <ScrollView style={styles.content}>
        {loading && exercises.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Dumbbell size={48} color="#CED4DA" />
            <Text style={styles.emptyText}>
              {seeding ? 'Ajout des exercices...' : 'Aucun exercice trouvé'}
            </Text>
            <Text style={styles.emptySubtext}>
              {seeding ? 'Veuillez patienter' : 'Utilisez le bouton + pour ajouter des exercices ou le bouton tag pour charger la bibliothèque par défaut'}
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                </View>
                
                <View style={styles.exerciseActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(exercise)}
                  >
                    <Edit size={20} color="#6EC1E4" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteExercise(exercise.id!)}
                  >
                    <Trash2 size={20} color="#DC3545" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.exerciseTags}>
                <View style={[styles.tag, styles.categoryTag]}>
                  <Text style={styles.tagText}>{exercise.category}</Text>
                </View>
                <View style={[styles.tag, styles.levelTag]}>
                  <Text style={styles.tagText}>{exercise.level}</Text>
                </View>
                <View style={[styles.tag, styles.equipmentTag]}>
                  <Text style={styles.tagText}>{exercise.equipment}</Text>
                </View>
              </View>
              
              <View style={styles.exerciseDetails}>
                <Text style={styles.detailText}>
                  {exercise.sets} séries × {exercise.reps} répétitions
                </Text>
                {exercise.videoUrl && (
                  <View style={styles.videoIndicator}>
                    <Video size={16} color="#28A745" />
                    <Text style={styles.videoText}>Vidéo disponible</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for Create/Edit */}
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
            
            <Text style={styles.modalTitle}>
              {editingExercise ? 'Modifier l\'exercice' : 'Nouvel exercice'}
            </Text>
            
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveExercise}
              disabled={loading}
            >
              <Save size={24} color="#6EC1E4" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom de l'exercice *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Pompes"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Description détaillée de l'exercice"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formGroup}>
              <VideoUploader
                onVideoUploaded={(videoUrl) => setFormData({ ...formData, videoUrl })}
                currentVideoUrl={formData.videoUrl}
                disabled={loading}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.pickerContainer}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.pickerOption,
                        formData.category === category && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, category: category as any })}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.category === category && styles.pickerOptionTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.label}>Niveau</Text>
                <View style={styles.pickerContainer}>
                  {levels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.pickerOption,
                        formData.level === level && styles.pickerOptionSelected
                      ]}
                      onPress={() => setFormData({ ...formData, level: level as any })}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        formData.level === level && styles.pickerOptionTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Matériel</Text>
              <View style={styles.pickerContainer}>
                {equipments.map((equipment) => (
                  <TouchableOpacity
                    key={equipment}
                    style={[
                      styles.pickerOption,
                      formData.equipment === equipment && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, equipment: equipment as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.equipment === equipment && styles.pickerOptionTextSelected
                    ]}>
                      {equipment}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Séries</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sets.toString()}
                  onChangeText={(text) => setFormData({ ...formData, sets: parseInt(text) || 1 })}
                  keyboardType="numeric"
                  placeholder="3"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.label}>Répétitions</Text>
                <TextInput
                  style={styles.input}
                  value={formData.reps}
                  onChangeText={(text) => setFormData({ ...formData, reps: text })}
                  placeholder="8-12"
                />
              </View>
            </View>
          </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    padding: 6,
  },
  content: {
    flex: 1,
    padding: 20,
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
  exerciseCard: {
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
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  exerciseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryTag: {
    backgroundColor: '#E3F2FD',
  },
  levelTag: {
    backgroundColor: '#E8F5E8',
  },
  equipmentTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
  },
  videoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
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
  modalSaveButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  formHalf: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  pickerOptionSelected: {
    backgroundColor: '#6EC1E4',
    borderColor: '#6EC1E4',
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
  },
  pickerOptionTextSelected: {
    color: '#FFFFFF',
  },
});