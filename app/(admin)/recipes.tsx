import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, CreditCard as Edit, Trash2, Save, X, ChefHat, Clock, Zap } from 'lucide-react-native';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { dataSeedingService } from '@/services/dataSeedingService';
import AppHeader from '@/components/AppHeader';

interface Recipe {
  id?: string;
  name: string;
  ingredients: string[];
  instructions: string;
  cookTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  season: 'Toute l\'année' | 'Printemps' | 'Été' | 'Automne' | 'Hiver';
  diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten';
  goal: 'Perte de poids' | 'Prise de muscle' | 'Performance' | 'Universel';
  mealType: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
}

export default function RecipesAdmin() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingredientInput, setIngredientInput] = useState('');
  const [seeding, setSeeding] = useState(false);
  
  const [formData, setFormData] = useState<Recipe>({
    name: '',
    ingredients: [],
    instructions: '',
    cookTime: 15,
    calories: 300,
    protein: 20,
    carbs: 30,
    fat: 10,
    season: 'Toute l\'année',
    diet: 'Standard',
    goal: 'Universel',
    mealType: 'Déjeuner',
  });

  useEffect(() => {
    loadRecipes();
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
        loadRecipes();
      } else {
        Alert.alert('Erreur', 'Impossible de peupler la base de données');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setSeeding(false);
    }
  };

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'recipes'));
      const recipesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];
      setRecipes(recipesData);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Erreur', 'Impossible de charger les recettes');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!formData.name.trim() || !formData.instructions.trim() || formData.ingredients.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      if (editingRecipe?.id) {
        await updateDoc(doc(db, 'recipes', editingRecipe.id), formData);
        Alert.alert('Succès', 'Recette mise à jour avec succès');
      } else {
        await addDoc(collection(db, 'recipes'), formData);
        Alert.alert('Succès', 'Recette créée avec succès');
      }
      
      setIsModalVisible(false);
      setEditingRecipe(null);
      resetForm();
      loadRecipes();
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la recette');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette recette ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'recipes', recipeId));
              Alert.alert('Succès', 'Recette supprimée avec succès');
              loadRecipes();
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la recette');
            }
          }
        }
      ]
    );
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, ingredientInput.trim()]
      });
      setIngredientInput('');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setFormData(recipe);
    setIsModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingRecipe(null);
    resetForm();
    setIsModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ingredients: [],
      instructions: '',
      cookTime: 15,
      calories: 300,
      protein: 20,
      carbs: 30,
      fat: 10,
      season: 'Toute l\'année',
      diet: 'Standard',
      goal: 'Universel',
      mealType: 'Déjeuner',
    });
    setIngredientInput('');
  };

  const seasons = ['Toute l\'année', 'Printemps', 'Été', 'Automne', 'Hiver'];
  const diets = ['Standard', 'Végétarien', 'Vegan', 'Sans gluten'];
  const goals = ['Universel', 'Perte de poids', 'Prise de muscle', 'Performance'];
  const mealTypes = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Gestion des Recettes" 
        showBackButton={true}
        colors={['#28A745', '#20C997']}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={openCreateModal}
              disabled={seeding}
            >
              <Plus size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            {recipes.length === 0 && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleSeedData}
                disabled={seeding}
              >
                <ChefHat size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Recipes List */}
      <ScrollView style={styles.content}>
        {loading && recipes.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ChefHat size={48} color="#CED4DA" />
            <Text style={styles.emptyText}>
              {seeding ? 'Ajout des recettes...' : 'Aucune recette trouvée'}
            </Text>
            <Text style={styles.emptySubtext}>
              {seeding ? 'Veuillez patienter' : 'Utilisez le bouton + pour ajouter des recettes ou le bouton chef pour charger la bibliothèque par défaut'}
            </Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{recipe.name}</Text>
                  <Text style={styles.recipeType}>{recipe.mealType}</Text>
                </View>
                
                <View style={styles.recipeActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(recipe)}
                  >
                    <Edit size={20} color="#28A745" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteRecipe(recipe.id!)}
                  >
                    <Trash2 size={20} color="#DC3545" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.recipeMacros}>
                <View style={styles.macroItem}>
                  <Zap size={16} color="#FF6B6B" />
                  <Text style={styles.macroText}>{recipe.calories} cal</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroText}>P: {recipe.protein}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroText}>G: {recipe.carbs}g</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroText}>L: {recipe.fat}g</Text>
                </View>
              </View>
              
              <View style={styles.recipeTags}>
                <View style={[styles.tag, styles.dietTag]}>
                  <Text style={styles.tagText}>{recipe.diet}</Text>
                </View>
                <View style={[styles.tag, styles.goalTag]}>
                  <Text style={styles.tagText}>{recipe.goal}</Text>
                </View>
                <View style={[styles.tag, styles.seasonTag]}>
                  <Text style={styles.tagText}>{recipe.season}</Text>
                </View>
              </View>
              
              <View style={styles.recipeDetails}>
                <View style={styles.timeIndicator}>
                  <Clock size={16} color="#666666" />
                  <Text style={styles.timeText}>{recipe.cookTime} min</Text>
                </View>
                <Text style={styles.ingredientCount}>
                  {recipe.ingredients.length} ingrédient{recipe.ingredients.length > 1 ? 's' : ''}
                </Text>
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
              {editingRecipe ? 'Modifier la recette' : 'Nouvelle recette'}
            </Text>
            
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveRecipe}
              disabled={loading}
            >
              <Save size={24} color="#28A745" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nom de la recette *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Ex: Salade de quinoa"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ingrédients *</Text>
              <View style={styles.ingredientInput}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={ingredientInput}
                  onChangeText={setIngredientInput}
                  placeholder="Ajouter un ingrédient"
                  onSubmitEditing={addIngredient}
                />
                <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredient}>
                  <Plus size={20} color="#28A745" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.ingredientsList}>
                {formData.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                    <TouchableOpacity onPress={() => removeIngredient(index)}>
                      <X size={16} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Instructions *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                placeholder="Étapes de préparation..."
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formHalf}>
                <Text style={styles.label}>Temps (min)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cookTime.toString()}
                  onChangeText={(text) => setFormData({ ...formData, cookTime: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="15"
                />
              </View>
              
              <View style={styles.formHalf}>
                <Text style={styles.label}>Calories</Text>
                <TextInput
                  style={styles.input}
                  value={formData.calories.toString()}
                  onChangeText={(text) => setFormData({ ...formData, calories: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="300"
                />
              </View>
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formThird}>
                <Text style={styles.label}>Protéines (g)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.protein.toString()}
                  onChangeText={(text) => setFormData({ ...formData, protein: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="20"
                />
              </View>
              
              <View style={styles.formThird}>
                <Text style={styles.label}>Glucides (g)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.carbs.toString()}
                  onChangeText={(text) => setFormData({ ...formData, carbs: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="30"
                />
              </View>
              
              <View style={styles.formThird}>
                <Text style={styles.label}>Lipides (g)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.fat.toString()}
                  onChangeText={(text) => setFormData({ ...formData, fat: parseInt(text) || 0 })}
                  keyboardType="numeric"
                  placeholder="10"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Type de repas</Text>
              <View style={styles.pickerContainer}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.pickerOption,
                      formData.mealType === type && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, mealType: type as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.mealType === type && styles.pickerOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Régime alimentaire</Text>
              <View style={styles.pickerContainer}>
                {diets.map((diet) => (
                  <TouchableOpacity
                    key={diet}
                    style={[
                      styles.pickerOption,
                      formData.diet === diet && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, diet: diet as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.diet === diet && styles.pickerOptionTextSelected
                    ]}>
                      {diet}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Objectif</Text>
              <View style={styles.pickerContainer}>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.pickerOption,
                      formData.goal === goal && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, goal: goal as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.goal === goal && styles.pickerOptionTextSelected
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Saison</Text>
              <View style={styles.pickerContainer}>
                {seasons.map((season) => (
                  <TouchableOpacity
                    key={season}
                    style={[
                      styles.pickerOption,
                      formData.season === season && styles.pickerOptionSelected
                    ]}
                    onPress={() => setFormData({ ...formData, season: season as any })}
                  >
                    <Text style={[
                      styles.pickerOptionText,
                      formData.season === season && styles.pickerOptionTextSelected
                    ]}>
                      {season}
                    </Text>
                  </TouchableOpacity>
                ))}
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
  recipeCard: {
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
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recipeInfo: {
    flex: 1,
    marginRight: 16,
  },
  recipeName: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  recipeType: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  recipeMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  macroText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
  },
  recipeTags: {
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
  dietTag: {
    backgroundColor: '#E3F2FD',
  },
  goalTag: {
    backgroundColor: '#E8F5E8',
  },
  seasonTag: {
    backgroundColor: '#FFF3E0',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#333333',
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
  ingredientCount: {
    fontSize: 14,
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
  formThird: {
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
    height: 100,
    textAlignVertical: 'top',
  },
  ingredientInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addIngredientButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#333333',
    flex: 1,
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
    backgroundColor: '#28A745',
    borderColor: '#28A745',
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