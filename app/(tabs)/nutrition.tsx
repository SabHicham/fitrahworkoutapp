import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '@/store/store';
import { updateConsumedCalories } from '@/store/slices/userSlice';
import { RefreshCw, Clock, Zap, Calendar, Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AppHeader from '@/components/AppHeader';

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
  { key: 'monday', label: 'Lundi', short: 'L' },
  { key: 'tuesday', label: 'Mardi', short: 'M' },
  { key: 'wednesday', label: 'Mercredi', short: 'M' },
  { key: 'thursday', label: 'Jeudi', short: 'J' },
  { key: 'friday', label: 'Vendredi', short: 'V' },
  { key: 'saturday', label: 'Samedi', short: 'S' },
  { key: 'sunday', label: 'Dimanche', short: 'D' },
];

export default function NutritionScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [nutritionPlan, setNutritionPlan] = useState<MealPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);
  const [targetCalories] = useState(2000);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [eatenMeals, setEatenMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadUserNutritionPlan();
  }, [user]);

  useEffect(() => {
    const unsubscribe = router.addListener?.('focus', () => {
      console.log('🔄 Page nutrition refocused, rechargement du plan');
      loadUserNutritionPlan();
    });

    return unsubscribe;
  }, [router]);

  const loadUserNutritionPlan = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('🍽️ Chargement du plan nutritionnel utilisateur...');
      
      const userProgramDoc = await getDoc(doc(db, 'userPrograms', user.uid));
      
      if (userProgramDoc.exists()) {
        const programData = userProgramDoc.data();
        const nutritionPlan = programData.nutritionPlan || [];
        
        console.log('✅ Plan nutritionnel chargé:', nutritionPlan.length, 'jours');
        setNutritionPlan(nutritionPlan);
        
        if (nutritionPlan.length > 0) {
          setSelectedDay(nutritionPlan[0]);
          setTotalCalories(nutritionPlan[0].totalCalories);
        }
      } else {
        console.log('❌ Aucun plan nutritionnel trouvé pour l\'utilisateur');
        setNutritionPlan([]);
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du plan nutritionnel:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealEaten = (meal: DailyMeal) => {
    if (eatenMeals.has(meal.recipeId)) {
      // Si le repas a déjà été mangé, on le retire
      const newEatenMeals = new Set(eatenMeals);
      newEatenMeals.delete(meal.recipeId);
      setEatenMeals(newEatenMeals);
      setConsumedCalories(prev => prev - meal.calories);
      
      // Mettre à jour les calories consommées dans le store global
      dispatch(updateConsumedCalories(-meal.calories));
    } else {
      // Sinon, on l'ajoute comme mangé
      const newEatenMeals = new Set(eatenMeals);
      newEatenMeals.add(meal.recipeId);
      setEatenMeals(newEatenMeals);
      setConsumedCalories(prev => prev + meal.calories);
      
      // Mettre à jour les calories consommées dans le store global
      dispatch(updateConsumedCalories(meal.calories));
    }
  };

  const handleDaySelect = (day: MealPlan) => {
    setSelectedDay(day);
    setTotalCalories(day.totalCalories);
  };

  const mealTypeIcons = {
    'Petit-déjeuner': '🌅',
    'Déjeuner': '🍽️',
    'Dîner': '🌙',
    'Collation': '🍎',
  };

  const caloriesPercentage = Math.min((totalCalories / targetCalories) * 100, 100);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de votre plan nutritionnel...</Text>
      </View>
    );
  }

  if (nutritionPlan.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Calendar size={48} color="#CED4DA" />
        <Text style={styles.emptyText}>Aucun plan nutritionnel trouvé</Text>
        <Text style={styles.emptySubtext}>
          Veuillez créer votre programme personnalisé
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <AppHeader 
        title="Nutrition 🍽️" 
        subtitle={selectedDay ? `Plan alimentaire - ${selectedDay.day}` : undefined}
        colors={['#28A745', '#20C997']}
      />
      
      {selectedDay && (
        <View style={styles.caloriesSummary}>
          <View style={styles.caloriesSummaryGlow} />
          <Text style={styles.caloriesText}>
            {consumedCalories} / {targetCalories} calories consommées
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressBarGlow} />
            <View style={[styles.progressFill, { width: `${(consumedCalories / targetCalories) * 100}%` }]} />
          </View>
        </View>
      )}

      <View style={styles.daysSection}>
        <Text style={styles.sectionTitle}>Vos journées</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll} contentContainerStyle={styles.daysContainer}>
          {nutritionPlan.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                selectedDay?.dayKey === day.dayKey && styles.dayCardActive
              ]}
              onPress={() => handleDaySelect(day)}
              activeOpacity={0.8}
            >
              <View style={styles.dayCardShadow} />
              <LinearGradient
                colors={selectedDay?.dayKey === day.dayKey ? ['#28A745', '#20C997'] : ['#F8F9FA', '#E9ECEF']}
                style={styles.dayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.dayOverlay} />
                <View style={styles.dayHeader}>
                  <Text style={[
                    styles.dayLabel,
                    selectedDay?.dayKey === day.dayKey && styles.dayLabelActive
                  ]}>
                    {day.day}
                  </Text>
                </View>
                <View style={styles.dayInfo}>
                  <Text style={[
                    styles.dayCalories,
                    selectedDay?.dayKey === day.dayKey && styles.dayCaloriesActive
                  ]}>
                    {day.totalCalories} cal
                  </Text>
                  <Text style={[
                    styles.dayMeals,
                    selectedDay?.dayKey === day.dayKey && styles.dayMealsActive
                  ]}>
                    {day.meals.length} repas
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedDay && (
        <>
          <View style={styles.mealsSection}>
            {selectedDay.meals.map((meal, index) => (
              <View key={index} style={styles.mealCard}>
                <View style={styles.mealCardGlow} />
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>
                    {mealTypeIcons[meal.type]} {meal.type}
                  </Text>
                  <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                </View>
                
                <Text style={styles.mealName}>{meal.name}</Text>
                
                <View style={styles.mealMacros}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroItemValue}>{meal.protein}g</Text>
                    <Text style={styles.macroItemLabel}>Protéines</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroItemValue}>{meal.carbs}g</Text>
                    <Text style={styles.macroItemLabel}>Glucides</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroItemValue}>{meal.fat}g</Text>
                    <Text style={styles.macroItemLabel}>Lipides</Text>
                  </View>
                </View>
                
                <View style={styles.mealInfo}>
                  <View style={styles.infoItem}>
                    <Clock size={16} color="#666666" />
                    <Text style={styles.infoText}>{meal.cookTime} min</Text>
                  </View>
                </View>

                <View style={styles.ingredientsSection}>
                  <Text style={styles.ingredientsTitle}>Ingrédients :</Text>
                  {meal.ingredients.map((ingredient, idx) => (
                    <Text key={idx} style={styles.ingredientItem}>• {ingredient}</Text>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.eatenButton,
                    eatenMeals.has(meal.recipeId) && styles.eatenButtonActive
                  ]}
                  onPress={() => handleMealEaten(meal)}
                  activeOpacity={0.8}
                >
                  <View style={styles.eatenButtonGlow} />
                  <Check size={16} color={eatenMeals.has(meal.recipeId) ? "#FFFFFF" : "#28A745"} />
                  <Text style={[
                    styles.eatenButtonText,
                    eatenMeals.has(meal.recipeId) && styles.eatenButtonTextActive
                  ]}>
                    {eatenMeals.has(meal.recipeId) ? "Mangé ✓" : "Mangé"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
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
  caloriesSummary: {
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
  caloriesSummaryGlow: {
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
  caloriesText: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
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
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
    borderRadius: 3,
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  daysSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 16,
    fontWeight: '800',
  },
  daysScroll: {
    flexDirection: 'row',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  dayCard: {
    width: 90,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  dayCardShadow: {
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
  dayCardActive: {
    transform: [{ scale: 1.02 }],
  },
  dayGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    position: 'relative',
  },
  dayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#4A5568',
    textAlign: 'center',
    fontWeight: '800',
  },
  dayLabelActive: {
    color: '#FFFFFF',
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayCalories: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '700',
  },
  dayCaloriesActive: {
    color: '#FFFFFF',
  },
  dayMeals: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#718096',
    textAlign: 'center',
    fontWeight: '500',
  },
  dayMealsActive: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  macrosSection: {
    padding: 20,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  macroValue: {
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
    color: '#28A745',
    marginBottom: 4,
    fontWeight: '800',
  },
  macroLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  mealsSection: {
    padding: 20,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  mealCardGlow: {
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
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
    fontWeight: '700',
  },
  mealCalories: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#666666',
    fontWeight: '800',
  },
  mealName: {
    fontSize: 19,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '700',
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.1)',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroItemValue: {
    fontSize: 17,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    fontWeight: '800',
  },
  macroItemLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  ingredientsSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 236, 239, 0.5)',
  },
  ingredientsTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
    fontWeight: '700',
  },
  ingredientItem: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  eatenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(40, 167, 69, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(40, 167, 69, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  eatenButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(40, 167, 69, 0.05)',
    borderRadius: 14,
  },
  eatenButtonActive: {
    backgroundColor: '#28A745',
    borderColor: '#28A745',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  eatenButtonText: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
    marginLeft: 8,
    fontWeight: '600',
  },
  eatenButtonTextActive: {
    color: '#FFFFFF',
  },
});