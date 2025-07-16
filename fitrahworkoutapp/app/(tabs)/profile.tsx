import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { updateAchievementProgress } from '@/store/slices/userSlice';
import { Target, Plus, X, Save, CreditCard as Edit3, Trash2, ArrowRight, Award } from 'lucide-react-native';
import { useObjectives } from '@/hooks/useFirestore';
import AppHeader from '@/components/AppHeader';

interface CustomObjective {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  category: 'fitness' | 'nutrition' | 'wellness';
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const { name, achievements } = useSelector((state: RootState) => state.user);
  const { saveObjectives, loadObjectives, savePerformances, loadPerformances, loading } = useObjectives();
  
  // États pour les objectifs personnalisés
  const [customObjectives, setCustomObjectives] = useState<CustomObjective[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingObjective, setEditingObjective] = useState<CustomObjective | null>(null);
  const [newObjective, setNewObjective] = useState({
    title: '',
    currentValue: 0,
    targetValue: 0,
    unit: 'reps',
    category: 'fitness' as 'fitness' | 'nutrition' | 'wellness'
  });

  // Charger les objectifs et performances au montage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Charger les objectifs personnalisés
      const objectivesResult = await loadObjectives();
      if (objectivesResult.success && objectivesResult.data) {
        setCustomObjectives(objectivesResult.data.objectives || []);
        console.log('✅ Objectifs chargés:', objectivesResult.data.objectives?.length || 0);
      } else {
        console.log('ℹ️ Aucun objectif personnalisé trouvé');
      }

      // Charger les performances (badges, discipline score)
      const performancesResult = await loadPerformances();
      if (performancesResult.success && performancesResult.data) {
        console.log('✅ Performances chargées');
        // Les performances sont déjà dans le store Redux via les achievements
      } else {
        console.log('ℹ️ Aucune performance personnalisée trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
    }
  };

  const saveUserObjectives = async (objectives: CustomObjective[]) => {
    try {
      const result = await saveObjectives(objectives);
      if (result.success) {
        console.log('✅ Objectifs sauvegardés avec succès');
      } else {
        console.error('❌ Erreur lors de la sauvegarde des objectifs:', result.error);
        Alert.alert('Erreur', 'Impossible de sauvegarder les objectifs');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la sauvegarde');
    }
  };

  const saveUserPerformances = async () => {
    try {
      const performancesData = {
        achievements,
        disciplineScore,
        badges: achievements.filter(a => a.unlocked).map(a => a.type),
        lastUpdated: new Date().toISOString()
      };

      const result = await savePerformances(performancesData);
      if (result.success) {
        console.log('✅ Performances sauvegardées avec succès');
      } else {
        console.error('❌ Erreur lors de la sauvegarde des performances:', result.error);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des performances:', error);
    }
  };

  const handleAddObjective = () => {
    if (!newObjective.title.trim() || newObjective.targetValue <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    const objective: CustomObjective = {
      id: Date.now().toString(),
      title: newObjective.title.trim(),
      currentValue: newObjective.currentValue,
      targetValue: newObjective.targetValue,
      unit: newObjective.unit,
      category: newObjective.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedObjectives = [...customObjectives, objective];
    setCustomObjectives(updatedObjectives);
    saveUserObjectives(updatedObjectives);

    // Reset form
    setNewObjective({
      title: '',
      currentValue: 0,
      targetValue: 0,
      unit: 'reps',
      category: 'fitness'
    });
    setIsModalVisible(false);
  };

  const handleEditObjective = (objective: CustomObjective) => {
    setEditingObjective(objective);
    setNewObjective({
      title: objective.title,
      currentValue: objective.currentValue,
      targetValue: objective.targetValue,
      unit: objective.unit,
      category: objective.category
    });
    setIsModalVisible(true);
  };

  const handleUpdateObjective = () => {
    if (!editingObjective || !newObjective.title.trim() || newObjective.targetValue <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    const updatedObjectives = customObjectives.map(obj => 
      obj.id === editingObjective.id 
        ? {
            ...obj,
            title: newObjective.title.trim(),
            currentValue: newObjective.currentValue,
            targetValue: newObjective.targetValue,
            unit: newObjective.unit,
            category: newObjective.category,
            updatedAt: new Date().toISOString()
          }
        : obj
    );

    setCustomObjectives(updatedObjectives);
    saveUserObjectives(updatedObjectives);

    // Reset form
    setEditingObjective(null);
    setNewObjective({
      title: '',
      currentValue: 0,
      targetValue: 0,
      unit: 'reps',
      category: 'fitness'
    });
    setIsModalVisible(false);
  };

  const handleDeleteObjective = (objectiveId: string) => {
    Alert.alert(
      'Supprimer l\'objectif',
      'Êtes-vous sûr de vouloir supprimer cet objectif ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const updatedObjectives = customObjectives.filter(obj => obj.id !== objectiveId);
            setCustomObjectives(updatedObjectives);
            saveUserObjectives(updatedObjectives);
          }
        }
      ]
    );
  };

  const handleProgressUpdate = (objectiveId: string, newValue: number) => {
    const updatedObjectives = customObjectives.map(obj => 
      obj.id === objectiveId 
        ? { ...obj, currentValue: newValue, updatedAt: new Date().toISOString() }
        : obj
    );
    setCustomObjectives(updatedObjectives);
    saveUserObjectives(updatedObjectives);
  };

  const handleAchievementProgress = (achievementId: string, newProgress: number) => {
    dispatch(updateAchievementProgress({ id: achievementId, progress: newProgress }));
    // Sauvegarder les performances après mise à jour
    setTimeout(() => {
      saveUserPerformances();
    }, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return '💪';
      case 'nutrition': return '🥗';
      case 'wellness': return '🧘';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return '#6EC1E4';
      case 'nutrition': return '#28A745';
      case 'wellness': return '#9C27B0';
      default: return '#666666';
    }
  };

  const units = ['reps', 'kg', 'min', 'km', 'cal', 'jours'];
  const categories = [
    { value: 'fitness', label: 'Fitness', icon: '💪' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'wellness', label: 'Bien-être', icon: '🧘' }
  ];

  return (
    <ScrollView style={styles.container}>
      <AppHeader 
        title="Fitrah Fiche 📊" 
        subtitle={`Salut ${name || 'Champion'} ! Voici tes performances et objectifs.`}
        colors={['#9C27B0', '#BA68C8']}
      />

      {/* Badges et achievements */}
      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeader}>
          <Award size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Mes Badges</Text>
        </View>
        
        {achievements.map((achievement, index) => (
          <View key={achievement.id} style={styles.achievementCard}>
            <View style={styles.achievementCardGlow} />
            <View style={styles.achievementHeader}>
              <View style={styles.achievementInfo}>
                <View style={styles.achievementTitleRow}>
                  <Text style={styles.achievementBadge}>
                    {achievement.type === 'Argent' ? '🥈' : 
                     achievement.type === 'Or' ? '🥇' : '💎'}
                  </Text>
                  <Text style={styles.achievementName}>{achievement.name}</Text>
                  {achievement.unlocked && (
                    <View style={styles.unlockedBadge}>
                      <Text style={styles.unlockedText}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={styles.progressBarGlow} />
                    <View style={[
                      styles.progressFill, 
                      { width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }
                    ]} />
                  </View>
                  <Text style={styles.progressText}>
                    {achievement.progress} / {achievement.target}
                  </Text>
                </View>
              </View>
            </View>
            
            {!achievement.unlocked && (
              <View style={styles.progressUpdateSection}>
                <Text style={styles.progressUpdateLabel}>Mettre à jour le progrès :</Text>
                <View style={styles.progressUpdateControls}>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => handleAchievementProgress(
                      achievement.id, 
                      Math.max(0, achievement.progress - 1)
                    )}
                  >
                    <Text style={styles.progressButtonText}>-</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.progressValue}>{achievement.progress}</Text>
                  
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => handleAchievementProgress(
                      achievement.id, 
                      Math.min(achievement.target, achievement.progress + 1)
                    )}
                  >
                    <Text style={styles.progressButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Objectifs personnalisés */}
      <View style={styles.objectivesSection}>
        <View style={styles.sectionHeader}>
          <Target size={20} color="#333333" />
          <Text style={styles.sectionTitle}>Mes Objectifs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingObjective(null);
              setNewObjective({
                title: '',
                currentValue: 0,
                targetValue: 0,
                unit: 'reps',
                category: 'fitness'
              });
              setIsModalVisible(true);
            }}
          >
            <Plus size={20} color="#9C27B0" />
          </TouchableOpacity>
        </View>

        {customObjectives.length === 0 ? (
          <View style={styles.emptyObjectives}>
            <Target size={48} color="#CED4DA" />
            <Text style={styles.emptyObjectivesText}>Aucun objectif personnalisé</Text>
            <Text style={styles.emptyObjectivesSubtext}>
              Ajoutez vos propres objectifs pour suivre vos progrès
            </Text>
          </View>
        ) : (
          customObjectives.map((objective) => {
            const progressPercentage = Math.min((objective.currentValue / objective.targetValue) * 100, 100);
            const isCompleted = objective.currentValue >= objective.targetValue;
            
            return (
              <View key={objective.id} style={styles.objectiveCard}>
                <View style={styles.objectiveCardGlow} />
                <View style={styles.objectiveHeader}>
                  <View style={styles.objectiveInfo}>
                    <View style={styles.objectiveTitleRow}>
                      <Text style={styles.objectiveIcon}>
                        {getCategoryIcon(objective.category)}
                      </Text>
                      <Text style={[
                        styles.objectiveTitle,
                        isCompleted && styles.objectiveTitleCompleted
                      ]}>
                        {objective.title}
                      </Text>
                      {isCompleted && (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedText}>✓</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.objectiveProgress}>
                      <View style={styles.progressBar}>
                        <View style={styles.progressBarGlow} />
                        <View style={[
                          styles.progressFill,
                          { 
                            width: `${progressPercentage}%`,
                            backgroundColor: getCategoryColor(objective.category)
                          }
                        ]} />
                      </View>
                      <Text style={styles.progressText}>
                        {objective.currentValue} / {objective.targetValue} {objective.unit}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.objectiveActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditObjective(objective)}
                    >
                      <Edit3 size={16} color="#6EC1E4" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteObjective(objective.id)}
                    >
                      <Trash2 size={16} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {!isCompleted && (
                  <View style={styles.performanceSection}>
                    <Text style={styles.performanceLabel}>Performance :</Text>
                    <View style={styles.performanceControls}>
                      <View style={styles.performanceInputGroup}>
                        <Text style={styles.performanceInputLabel}>Actuel</Text>
                        <TextInput
                          style={styles.performanceInput}
                          value={objective.currentValue.toString()}
                          onChangeText={(text) => {
                            const value = parseInt(text) || 0;
                            handleProgressUpdate(objective.id, value);
                          }}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                      </View>
                      
                      <ArrowRight size={16} color="#666666" style={styles.performanceArrow} />
                      
                      <View style={styles.performanceInputGroup}>
                        <Text style={styles.performanceInputLabel}>Objectif</Text>
                        <View style={styles.performanceDisplay}>
                          <Text style={styles.performanceDisplayText}>
                            {objective.targetValue}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.unitDisplay}>
                        <Text style={styles.unitDisplayText}>{objective.unit}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Modal pour ajouter/modifier un objectif */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
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
              {editingObjective ? 'Modifier l\'objectif' : 'Nouvel objectif'}
            </Text>
            
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={editingObjective ? handleUpdateObjective : handleAddObjective}
              disabled={loading}
            >
              <Save size={24} color="#9C27B0" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Titre de l'objectif</Text>
              <TextInput
                style={styles.formInput}
                value={newObjective.title}
                onChangeText={(text) => setNewObjective({ ...newObjective, title: text })}
                placeholder="Ex: Faire 20 pompes d'affilée"
                placeholderTextColor="#999999"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Catégorie</Text>
              <View style={styles.categoryContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[
                      styles.categoryButton,
                      newObjective.category === category.value && styles.categoryButtonActive
                    ]}
                    onPress={() => setNewObjective({ ...newObjective, category: category.value as any })}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      newObjective.category === category.value && styles.categoryTextActive
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.performanceFormSection}>
              <Text style={styles.performanceFormTitle}>Performance</Text>
              <View style={styles.performanceFormControls}>
                <View style={styles.performanceFormGroup}>
                  <Text style={styles.performanceFormLabel}>Actuel</Text>
                  <TextInput
                    style={styles.performanceFormInput}
                    value={newObjective.currentValue.toString()}
                    onChangeText={(text) => setNewObjective({ 
                      ...newObjective, 
                      currentValue: parseInt(text) || 0 
                    })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                
                <ArrowRight size={16} color="#666666" style={styles.performanceFormArrow} />
                
                <View style={styles.performanceFormGroup}>
                  <Text style={styles.performanceFormLabel}>Objectif</Text>
                  <TextInput
                    style={styles.performanceFormInput}
                    value={newObjective.targetValue.toString()}
                    onChangeText={(text) => setNewObjective({ 
                      ...newObjective, 
                      targetValue: parseInt(text) || 0 
                    })}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
              
              <View style={styles.unitFormSection}>
                <Text style={styles.unitFormLabel}>Unité :</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.unitScrollContainer}
                >
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        newObjective.unit === unit && styles.unitButtonActive
                      ]}
                      onPress={() => setNewObjective({ ...newObjective, unit })}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        newObjective.unit === unit && styles.unitButtonTextActive
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginLeft: 8,
    flex: 1,
    fontWeight: '800',
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  achievementCardGlow: {
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
  achievementHeader: {
    marginBottom: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementBadge: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementName: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    fontWeight: '700',
  },
  unlockedBadge: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlockedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  achievementDescription: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginBottom: 12,
    lineHeight: 22,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(233, 236, 239, 0.6)',
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
    color: '#333333',
    minWidth: 60,
    fontWeight: '700',
  },
  progressUpdateSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(233, 236, 239, 0.6)',
    paddingTop: 16,
    marginTop: 16,
  },
  progressUpdateLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '600',
  },
  progressUpdateControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  progressButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6EC1E4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressButtonText: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    minWidth: 40,
    textAlign: 'center',
    fontWeight: '800',
  },
  objectivesSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  emptyObjectives: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyObjectivesText: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#666666',
    marginTop: 16,
    fontWeight: '700',
  },
  emptyObjectivesSubtext: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  objectiveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  objectiveCardGlow: {
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
  objectiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  objectiveInfo: {
    flex: 1,
    marginRight: 16,
  },
  objectiveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  objectiveIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  objectiveTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    fontWeight: '700',
  },
  objectiveTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#28A745',
  },
  completedBadge: {
    backgroundColor: '#28A745',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  completedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  objectiveProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  objectiveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  performanceSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(233, 236, 239, 0.8)',
  },
  performanceLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  performanceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  performanceInputGroup: {
    alignItems: 'center',
    minWidth: 80,
  },
  performanceInputLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
    marginBottom: 4,
    fontWeight: '600',
  },
  performanceInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    minWidth: 60,
    fontWeight: '700',
  },
  performanceArrow: {
    marginHorizontal: 8,
  },
  performanceDisplay: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    minWidth: 60,
    alignItems: 'center',
  },
  performanceDisplayText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    fontWeight: '700',
  },
  unitDisplay: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(110, 193, 228, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.3)',
  },
  unitDisplayText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    fontWeight: '600',
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
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
  },
  modalSaveButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    fontWeight: '600',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  performanceFormSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(233, 236, 239, 0.8)',
  },
  performanceFormTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  performanceFormControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  performanceFormGroup: {
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
  },
  performanceFormLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
    marginBottom: 8,
    fontWeight: '600',
  },
  performanceFormInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    backgroundColor: '#FFFFFF',
    textAlign: 'center',
    width: '100%',
    fontWeight: '700',
  },
  performanceFormArrow: {
    marginHorizontal: 8,
  },
  unitFormSection: {
    alignItems: 'center',
  },
  unitFormLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '600',
  },
  unitScrollContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    minWidth: 60,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: '#6EC1E4',
    borderColor: '#6EC1E4',
  },
  unitButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#FFFFFF',
  },
});