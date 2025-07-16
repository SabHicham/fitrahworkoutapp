import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Types pour la génération de programme
interface UserPreferences {
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goal: 'Perdre du poids' | 'Prise de muscle' | 'Performance';
  diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten';
  selectedDays: string[];
  daysPerWeek: number;
}

interface GeneratedProgram {
  id: string;
  userId: string;
  name: string;
  description: string;
  preferences: UserPreferences;
  workoutPlan: WorkoutSession[];
  nutritionPlan: MealPlan[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

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
}

interface MealPlan {
  day: string;
  dayKey: string;
  meals: DailyMeal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface DailyMeal {
  recipeId: string;
  name: string;
  type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  cookTime: number;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

// Logique PPL (Push/Pull/Legs) intelligente
const PPL_SEQUENCE = ['Push', 'Pull', 'Legs'];

export const programGenerationService = {
  // Vérifier si l'utilisateur a déjà un programme
  async hasExistingProgram(userId: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification programme existant pour userId:', userId);
      const programDoc = await getDoc(doc(db, 'userPrograms', userId));
      const exists = programDoc.exists();
      const isActive = exists ? programDoc.data()?.isActive !== false : false;
      
      console.log('📊 Résultat vérification:', { exists, isActive });
      return exists && isActive;
    } catch (error) {
      console.error('Error checking existing program:', error);
      return false;
    }
  },

  // Récupérer le programme existant
  async getExistingProgram(userId: string): Promise<GeneratedProgram | null> {
    try {
      console.log('📖 Récupération programme existant pour userId:', userId);
      const programDoc = await getDoc(doc(db, 'userPrograms', userId));
      if (programDoc.exists()) {
        const programData = programDoc.data();
        console.log('✅ Programme trouvé:', {
          name: programData.name,
          isActive: programData.isActive,
          workoutPlan: programData.workoutPlan?.length || 0,
          nutritionPlan: programData.nutritionPlan?.length || 0
        });
        return { id: programDoc.id, ...programData } as GeneratedProgram;
      }
      console.log('❌ Aucun programme trouvé');
      return null;
    } catch (error) {
      console.error('Error getting existing program:', error);
      return null;
    }
  },

  // Générer un nouveau programme basé sur les préférences
  async generateProgram(userId: string, preferences: UserPreferences): Promise<{ success: boolean; program?: GeneratedProgram; error?: any }> {
    try {
      console.log('🎯 Génération du programme pour:', userId, preferences);

      // 1. Récupérer les exercices adaptés
      const exercises = await this.getFilteredExercises(preferences);
      if (exercises.length === 0) {
        console.warn('⚠️ Aucun exercice trouvé, utilisation des exercices par défaut');
        // Utiliser des exercices par défaut si aucun n'est trouvé
        const defaultExercises = await this.getDefaultExercises();
        if (defaultExercises.length === 0) {
          throw new Error('Aucun exercice disponible dans la base de données');
        }
        exercises.push(...defaultExercises);
      }

      // 2. Récupérer les recettes adaptées
      const recipes = await this.getFilteredRecipes(preferences);
      if (recipes.length === 0) {
        console.warn('⚠️ Aucune recette trouvée, utilisation des recettes par défaut');
        // Utiliser des recettes par défaut si aucune n'est trouvée
        const defaultRecipes = await this.getDefaultRecipes();
        if (defaultRecipes.length === 0) {
          throw new Error('Aucune recette disponible dans la base de données');
        }
        recipes.push(...defaultRecipes);
      }

      // 3. Créer le plan d'entraînement avec logique PPL
      const workoutPlan = this.createWorkoutPlan(exercises, preferences);

      // 4. Créer le plan nutritionnel
      const nutritionPlan = this.createNutritionPlan(recipes, preferences);

      // 5. Assembler le programme complet
      const program: GeneratedProgram = {
        id: userId,
        userId,
        name: this.generateProgramName(preferences),
        description: this.generateProgramDescription(preferences),
        preferences,
        workoutPlan,
        nutritionPlan,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      // 6. Sauvegarder en base de données
      await this.saveProgram(program);

      console.log('✅ Programme généré et sauvegardé avec succès');
      return { success: true, program };
    } catch (error) {
      console.error('❌ Erreur lors de la génération du programme:', error);
      console.error('❌ Stack trace:', error.stack);
      return { success: false, error };
    }
  },

  // Récupérer les exercices filtrés selon les préférences
  async getFilteredExercises(preferences: UserPreferences): Promise<any[]> {
    try {
      console.log('🔍 Recherche d\'exercices pour:', preferences.level, preferences.goal);
      
      const exercisesRef = collection(db, 'exercises');
      
      // Requête simple sans orderBy pour éviter les erreurs d'index
      let q = query(exercisesRef, where('level', '==', preferences.level));

      const snapshot = await getDocs(q);
      const allExercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(`📊 ${allExercises.length} exercices trouvés pour le niveau ${preferences.level}`);

      // Filtrer par objectif si nécessaire
      let filteredExercises = allExercises;
      if (preferences.goal === 'Perdre du poids') {
        filteredExercises = allExercises.filter(ex => 
          ex.category === 'Cardio' || ex.category === 'Core' || ex.equipment === 'Poids du corps'
        );
      } else if (preferences.goal === 'Prise de muscle') {
        filteredExercises = allExercises.filter(ex => 
          ex.category === 'Push' || ex.category === 'Pull' || ex.category === 'Legs'
        );
      }

      console.log(`🎯 ${filteredExercises.length} exercices filtrés pour ${preferences.goal}`);
      return filteredExercises;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des exercices:', error);
      return [];
    }
  },

  // Récupérer des exercices par défaut si aucun n'est trouvé
  async getDefaultExercises(): Promise<any[]> {
    try {
      console.log('🔄 Récupération des exercices par défaut...');
      const exercisesRef = collection(db, 'exercises');
      const q = query(exercisesRef, limit(20));
      const snapshot = await getDocs(q);
      const exercises = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`📦 ${exercises.length} exercices par défaut récupérés`);
      return exercises;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des exercices par défaut:', error);
      return [];
    }
  },

  // Récupérer les recettes filtrées selon les préférences
  async getFilteredRecipes(preferences: UserPreferences): Promise<any[]> {
    try {
      console.log('🔍 Recherche de recettes pour:', preferences.diet, preferences.goal);
      
      const recipesRef = collection(db, 'recipes');
      
      // Requête simple sans orderBy pour éviter les erreurs d'index
      let q = query(recipesRef, where('diet', '==', preferences.diet));

      const snapshot = await getDocs(q);
      let recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log(`📊 ${recipes.length} recettes trouvées pour le régime ${preferences.diet}`);

      // Filtrer par objectif
      recipes = recipes.filter(recipe => 
        recipe.goal === preferences.goal || recipe.goal === 'Universel'
      );

      console.log(`🎯 ${recipes.length} recettes filtrées pour ${preferences.goal}`);
      return recipes;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des recettes:', error);
      return [];
    }
  },

  // Récupérer des recettes par défaut si aucune n'est trouvée
  async getDefaultRecipes(): Promise<any[]> {
    try {
      console.log('🔄 Récupération des recettes par défaut...');
      const recipesRef = collection(db, 'recipes');
      const q = query(recipesRef, limit(20));
      const snapshot = await getDocs(q);
      const recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`📦 ${recipes.length} recettes par défaut récupérées`);
      return recipes;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des recettes par défaut:', error);
      return [];
    }
  },

  // Créer le plan d'entraînement avec logique PPL intelligente
  createWorkoutPlan(exercises: any[], preferences: UserPreferences): WorkoutSession[] {
    const workoutPlan: WorkoutSession[] = [];
    const selectedDays = preferences.selectedDays;
    
    console.log('🏋️‍♂️ Création du plan d\'entraînement PPL pour', selectedDays.length, 'jours');
    
    // Grouper les exercices par catégorie
    const exercisesByCategory = exercises.reduce((acc, exercise) => {
      if (!acc[exercise.category]) acc[exercise.category] = [];
      acc[exercise.category].push(exercise);
      return acc;
    }, {} as Record<string, any[]>);

    // Générer la séquence PPL intelligente selon le nombre de jours
    const sessionTypes = this.generatePPLSequence(selectedDays.length);
    
    selectedDays.forEach((dayKey, index) => {
      const dayLabel = DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
      const sessionType = sessionTypes[index % sessionTypes.length];
      
      const session: WorkoutSession = {
        day: dayLabel,
        dayKey: dayKey,
        name: `${sessionType} - ${dayLabel}`,
        type: sessionType,
        exercises: [],
        estimatedDuration: 0,
      };

      // Sélectionner les exercices pour cette séance
      const sessionExercises = this.selectExercisesForSession(
        exercisesByCategory, 
        sessionType, 
        preferences.level
      );
      
      session.exercises = sessionExercises.map(exercise => ({
        exerciseId: exercise.id,
        name: exercise.name,
        sets: exercise.sets || 3,
        reps: exercise.reps || '8-12',
        restTime: this.getRestTime(exercise.category, preferences.level),
        category: exercise.category,
        level: exercise.level,
        equipment: exercise.equipment,
        description: exercise.description || 'Exercice de renforcement musculaire',
      }));

      session.estimatedDuration = this.calculateSessionDuration(session.exercises);
      workoutPlan.push(session);
      
      console.log(`📅 ${dayLabel}: ${sessionType} - ${session.exercises.length} exercices`);
    });

    return workoutPlan;
  },

  // Générer la séquence PPL intelligente selon le nombre de jours
  generatePPLSequence(numDays: number): ('Push' | 'Pull' | 'Legs' | 'Cardio' | 'Core')[] {
    const sequence: ('Push' | 'Pull' | 'Legs' | 'Cardio' | 'Core')[] = [];
    
    if (numDays === 1) {
      sequence.push('Push'); // Corps complet orienté Push
    } else if (numDays === 2) {
      sequence.push('Push', 'Pull'); // Haut du corps
    } else if (numDays === 3) {
      sequence.push('Push', 'Pull', 'Legs'); // PPL classique
    } else if (numDays === 4) {
      sequence.push('Push', 'Pull', 'Legs', 'Push'); // PPL + Push
    } else if (numDays === 5) {
      sequence.push('Push', 'Pull', 'Legs', 'Push', 'Pull'); // PPL + PP
    } else if (numDays === 6) {
      sequence.push('Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs'); // PPL x2
    } else if (numDays === 7) {
      sequence.push('Push', 'Pull', 'Legs', 'Cardio', 'Push', 'Pull', 'Core'); // PPL + Cardio + PPL + Core
    }
    
    console.log('🔄 Séquence PPL générée:', sequence);
    return sequence;
  },

  // Sélectionner les exercices pour une séance spécifique
  selectExercisesForSession(
    exercisesByCategory: Record<string, any[]>, 
    sessionType: string, 
    level: string
  ): any[] {
    const selectedExercises: any[] = [];
    
    // Définir les catégories d'exercices selon le type de séance
    let targetCategories: string[] = [];
    
    switch (sessionType) {
      case 'Push':
        targetCategories = ['Push'];
        break;
      case 'Pull':
        targetCategories = ['Pull'];
        break;
      case 'Legs':
        targetCategories = ['Legs'];
        break;
      case 'Cardio':
        targetCategories = ['Cardio', 'Core'];
        break;
      case 'Core':
        targetCategories = ['Core', 'Cardio'];
        break;
      default:
        targetCategories = ['Push', 'Pull', 'Legs'];
    }
    
    // Sélectionner 4-6 exercices selon le niveau
    const exerciseCount = level === 'Débutant' ? 4 : level === 'Intermédiaire' ? 5 : 6;
    
    targetCategories.forEach(category => {
      const exercises = exercisesByCategory[category] || [];
      if (exercises.length > 0) {
        // Sélectionner 2-3 exercices par catégorie
        const countPerCategory = Math.min(
          Math.ceil(exerciseCount / targetCategories.length),
          exercises.length
        );
        
        for (let i = 0; i < countPerCategory && selectedExercises.length < exerciseCount; i++) {
          const randomIndex = Math.floor(Math.random() * exercises.length);
          const exercise = exercises[randomIndex];
          
          // Éviter les doublons
          if (!selectedExercises.find(ex => ex.id === exercise.id)) {
            selectedExercises.push(exercise);
          }
        }
      }
    });
    
    // Si pas assez d'exercices, compléter avec d'autres catégories
    if (selectedExercises.length < exerciseCount) {
      const allCategories = Object.keys(exercisesByCategory);
      for (const category of allCategories) {
        if (selectedExercises.length >= exerciseCount) break;
        
        const exercises = exercisesByCategory[category] || [];
        for (const exercise of exercises) {
          if (selectedExercises.length >= exerciseCount) break;
          
          if (!selectedExercises.find(ex => ex.id === exercise.id)) {
            selectedExercises.push(exercise);
          }
        }
      }
    }
    
    return selectedExercises.slice(0, exerciseCount);
  },

  // Créer le plan nutritionnel
  createNutritionPlan(recipes: any[], preferences: UserPreferences): MealPlan[] {
    const nutritionPlan: MealPlan[] = [];
    const allDays = DAYS_OF_WEEK.map(day => day.key); // Toujours 7 jours pour la nutrition

    console.log('🍽️ Création du plan nutritionnel pour 7 jours (nutrition quotidienne)');

    // Grouper les recettes par type de repas
    const recipesByType = recipes.reduce((acc, recipe) => {
      if (!acc[recipe.mealType]) acc[recipe.mealType] = [];
      acc[recipe.mealType].push(recipe);
      return acc;
    }, {} as Record<string, any[]>);

    allDays.forEach(dayKey => {
      const dayLabel = DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
      const dailyMeals: DailyMeal[] = [];
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;

      // Sélectionner les repas pour la journée
      const mealTypes = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation'];
      
      mealTypes.forEach(mealType => {
        const availableRecipes = recipesByType[mealType] || [];
        if (availableRecipes.length > 0) {
          const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
          
          const meal: DailyMeal = {
            recipeId: selectedRecipe.id,
            name: selectedRecipe.name,
            type: mealType as any,
            calories: selectedRecipe.calories || 300,
            protein: selectedRecipe.protein || 20,
            carbs: selectedRecipe.carbs || 30,
            fat: selectedRecipe.fat || 10,
            ingredients: selectedRecipe.ingredients || ['Ingrédients à définir'],
            cookTime: selectedRecipe.cookTime || 15,
          };

          dailyMeals.push(meal);
          totalCalories += meal.calories;
          totalProtein += meal.protein;
          totalCarbs += meal.carbs;
          totalFat += meal.fat;
        } else {
          // Créer un repas par défaut si aucune recette n'est disponible
          const defaultMeal: DailyMeal = {
            recipeId: `default-${mealType.toLowerCase()}`,
            name: `${mealType} équilibré`,
            type: mealType as any,
            calories: 300,
            protein: 20,
            carbs: 30,
            fat: 10,
            ingredients: ['Ingrédients équilibrés selon vos préférences'],
            cookTime: 15,
          };
          
          dailyMeals.push(defaultMeal);
          totalCalories += defaultMeal.calories;
          totalProtein += defaultMeal.protein;
          totalCarbs += defaultMeal.carbs;
          totalFat += defaultMeal.fat;
        }
      });

      nutritionPlan.push({
        day: dayLabel,
        dayKey: dayKey,
        meals: dailyMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      });

      console.log(`🍽️ ${dayLabel}: ${dailyMeals.length} repas - ${totalCalories} cal`);
    });

    return nutritionPlan;
  },

  // Sauvegarder le programme en base de données
  async saveProgram(program: GeneratedProgram): Promise<void> {
    try {
      console.log('💾 Sauvegarde du programme...');
      console.log('💾 Sauvegarde du programme pour l\'utilisateur:', program.userId);
      console.log('📊 Programme à sauvegarder:', {
        name: program.name,
        workoutSessions: program.workoutPlan?.length || 0,
        nutritionDays: program.nutritionPlan?.length || 0,
        preferences: program.preferences,
        isActive: program.isActive
      });
      
      // Sauvegarder uniquement dans userPrograms
      await setDoc(doc(db, 'userPrograms', program.userId), program);
      console.log('✅ Document sauvegardé dans userPrograms/' + program.userId);
      console.log('✅ Programme sauvegardé avec succès dans userPrograms');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      console.error('❌ Détails de l\'erreur:', error.code, error.message);
      
      // Fournir plus de détails sur l'erreur
      if (error.code === 'permission-denied') {
        console.error('❌ Permissions insuffisantes. Vérifiez les règles Firestore pour:');
        console.error('   - Collection: userPrograms');
        console.error('   - Document ID:', program.userId);
      }
      
      throw error;
    }
  },

  // Mettre à jour un programme existant
  async updateProgram(userId: string, preferences: UserPreferences): Promise<{ success: boolean; program?: GeneratedProgram; error?: any }> {
    try {
      console.log('🔄 Mise à jour du programme pour:', userId);
      
      // Générer un nouveau programme
      const result = await this.generateProgram(userId, preferences);
      
      if (result.success) {
        console.log('✅ Programme mis à jour avec succès');
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return { success: false, error };
    }
  },

  // Fonctions utilitaires
  generateProgramName(preferences: UserPreferences): string {
    const goalNames = {
      'Perdre du poids': 'Perte de Poids',
      'Prise de muscle': 'Prise de Masse',
      'Performance': 'Performance'
    };
    
    return `Programme ${goalNames[preferences.goal]} - ${preferences.level}`;
  },

  generateProgramDescription(preferences: UserPreferences): string {
    const dayLabels = preferences.selectedDays.map(dayKey => 
      DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey
    ).join(', ');
    
    return `Programme personnalisé ${preferences.level.toLowerCase()} pour ${preferences.goal.toLowerCase()}, ${preferences.daysPerWeek} jours par semaine (${dayLabels}) avec régime ${preferences.diet.toLowerCase()}.`;
  },

  getRestTime(category: string, level: string): number {
    const baseTimes = {
      'Push': 90,
      'Pull': 90,
      'Legs': 120,
      'Cardio': 30,
      'Core': 60,
    };

    const levelMultipliers = {
      'Débutant': 1.2,
      'Intermédiaire': 1.0,
      'Avancé': 0.8,
    };

    return Math.round((baseTimes[category as keyof typeof baseTimes] || 60) * levelMultipliers[level as keyof typeof levelMultipliers]);
  },

  calculateSessionDuration(exercises: ProgramExercise[]): number {
    // Estimation: (sets * reps moyen * 3 secondes) + temps de repos
    let totalTime = 0;
    
    exercises.forEach(exercise => {
      const avgReps = 10; // Estimation moyenne
      const exerciseTime = exercise.sets * avgReps * 3; // 3 secondes par rep
      const restTime = exercise.sets * exercise.restTime;
      totalTime += exerciseTime + restTime;
    });

    return Math.round(totalTime / 60); // Convertir en minutes
  },
};