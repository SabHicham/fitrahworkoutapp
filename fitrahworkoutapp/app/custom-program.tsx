import React, { useState } from 'react';
import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { ArrowLeft, Target, Zap, TrendingUp, Award, Utensils, Leaf, Wheat, Heart, Calendar, RefreshCw } from 'lucide-react-native';
import { useProgramGeneration } from '@/hooks/useProgramGeneration';
import AppHeader from '@/components/AppHeader';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi', short: 'L' },
  { key: 'tuesday', label: 'Mardi', short: 'M' },
  { key: 'wednesday', label: 'Mercredi', short: 'M' },
  { key: 'thursday', label: 'Jeudi', short: 'J' },
  { key: 'friday', label: 'Vendredi', short: 'V' },
  { key: 'saturday', label: 'Samedi', short: 'S' },
  { key: 'sunday', label: 'Dimanche', short: 'D' },
];

// Fonction pour obtenir le jour actuel
const getCurrentDayKey = () => {
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
  return currentDayIndex === 0 ? 'sunday' : DAYS_OF_WEEK[currentDayIndex - 1].key;
};

// Fonction pour obtenir les jours par défaut à partir du jour actuel
const getDefaultSelectedDays = () => {
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
  
  // Convertir l'index JavaScript (0=dimanche) vers notre système (0=lundi)
  const adjustedDayIndex = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
  
  // Sélectionner 3 jours par défaut incluant aujourd'hui
  const defaultDays = [];
  for (let i = 0; i < 3; i++) {
    const dayIndex = (adjustedDayIndex + i * 2) % 7; // Espacer de 2 jours
    defaultDays.push(DAYS_OF_WEEK[dayIndex].key);
  }
  
  return defaultDays;
};

export default function CustomProgramScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const userState = useSelector((state: RootState) => state.user);
  const { level, goal, diet } = userState;
  const selectedDaysInitial = userState.selectedDays ? [...userState.selectedDays] : getDefaultSelectedDays();
  const { updateExistingProgram, loading, checkExistingProgram } = useProgramGeneration();
  
  const [selectedLevel, setSelectedLevel] = useState(level);
  const [selectedGoal, setSelectedGoal] = useState(goal);
  const [selectedDiet, setSelectedDiet] = useState(diet);
  const [selectedDaysState, setSelectedDaysState] = useState<string[]>(selectedDaysInitial);

  const currentDay = getCurrentDayKey();
  
  // Fonction pour charger les préférences depuis Firestore et mettre à jour les états
  const loadUserPreferencesFromFirestore = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Chargement des préférences depuis Firestore dans custom-program...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Préférences trouvées dans Firestore (custom-program):', {
          level: userData.level,
          goal: userData.goal,
          diet: userData.diet,
          selectedDays: userData.selectedDays});
        
        // Mettre à jour les états locaux avec les préférences Firestore
        if (userData.level) setSelectedLevel(userData.level);
        if (userData.goal) setSelectedGoal(userData.goal);
        if (userData.diet) setSelectedDiet(userData.diet);
        if (userData.selectedDays && userData.selectedDays.length > 0) {
          setSelectedDaysState(userData.selectedDays);
        }
        
        // Mettre à jour Redux avec les données complètes
        dispatch(setUserData({
          level: userData.level || 'Débutant',
          goal: userData.goal || 'Perdre du poids',
          diet: userData.diet || 'Standard',
          selectedDays: userData.selectedDays || getDefaultSelectedDays(),
          daysPerWeek: userData.selectedDays?.length || 3,
        }));
        return true; // Indique que les préférences ont été chargées
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des préférences Firestore:', error);
    }
  };
  
  // Vérifier si l'utilisateur a un programme au chargement
  useEffect(() => {
    let isMounted = true;
    
    const checkUserProgramOnMount = async () => {
      if (!user) return;
      
      try {
        const { hasProgram } = await checkExistingProgram();
        
        if (!hasProgram) {
          if (!isMounted) return;
          console.log('⚠️ Aucun programme trouvé, redirection vers le setup');
          router.replace('/program-setup');
        } else {
          // Charger les préférences depuis Firestore si elles ne sont pas en mémoire
          if (!userState.level || !userState.goal || !userState.diet) {
            await loadUserPreferencesFromFirestore();
          }
        }
      } catch (error) {
        console.log('ℹ️ Erreur lors de la vérification du programme');
      }
    };

    checkUserProgramOnMount();
    
    return () => {
      isMounted = false;
    };
  }, [user?.uid]); // Dépendance stable uniquement

  const levels = [
    { value: 'Débutant' as const, title: 'Débutant 🌱', description: 'Je débute ma remise en forme', icon: Zap },
    { value: 'Intermédiaire' as const, title: 'Intermédiaire 💪', description: 'J\'ai déjà une base d\'entraînement', icon: TrendingUp },
    { value: 'Avancé' as const, title: 'Avancé 🔥', description: 'Je m\'entraîne régulièrement', icon: Award },
  ];

  const goals = [
    { value: 'Perdre du poids' as const, title: 'Perdre du poids ⚖️', description: 'Brûler les graisses et affiner ma silhouette', icon: TrendingUp },
    { value: 'Prise de muscle' as const, title: 'Prise de muscle 💪', description: 'Développer ma masse musculaire', icon: Target },
    { value: 'Performance' as const, title: 'Performance 🏃‍♂️', description: 'Améliorer ma condition physique', icon: Zap },
  ];

  const diets = [
    { value: 'Standard' as const, title: 'Standard 🍽️', description: 'Alimentation équilibrée classique', icon: Utensils },
    { value: 'Végétarien' as const, title: 'Végétarien 🥗', description: 'Sans viande ni poisson', icon: Leaf },
    { value: 'Vegan' as const, title: 'Vegan 🌱', description: 'Aucun produit d\'origine animale', icon: Heart },
    { value: 'Sans gluten' as const, title: 'Sans gluten 🌾', description: 'Éviter le gluten', icon: Wheat },
  ];

  const toggleDay = (dayKey: string) => {
    setSelectedDaysState(prev => {
      if (prev.includes(dayKey)) {
        // Retirer le jour
        return prev.filter(d => d !== dayKey);
      } else {
        // Ajouter le jour et trier selon l'ordre de la semaine
        const newDays = [...prev, dayKey];
        return newDays.sort((a, b) => {
          const aIndex = DAYS_OF_WEEK.findIndex(d => d.key === a);
          const bIndex = DAYS_OF_WEEK.findIndex(d => d.key === b);
          return aIndex - bIndex;
        });
      }
    });
  };

  const handleGenerateProgram = async () => {
    if (selectedDaysState.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un jour d\'entraînement dans la semaine');
      return;
    }

    if (selectedDaysState.length > 7) {
      Alert.alert('Erreur', 'Vous ne pouvez pas sélectionner plus de 7 jours');
      return;
    }

    try {
      const preferences = {
        level: selectedLevel,
        goal: selectedGoal,
        diet: selectedDiet,
        selectedDays: selectedDaysState,
        daysPerWeek: selectedDaysState.length,
      };

      const result = await updateExistingProgram(preferences);

      if (result.success) {
        // Mettre à jour les préférences utilisateur dans Redux
        dispatch(setUserData({
          level: selectedLevel,
          goal: selectedGoal,
          diet: selectedDiet,
          selectedDays: selectedDaysState,
          daysPerWeek: selectedDaysState.length,
          updatedAt: new Date().toISOString(),
        }));

        // Redirection automatique vers l'entraînement
        console.log('✅ Programme mis à jour avec succès, redirection vers training');
        router.replace('/(tabs)/training');
      } else {
        Alert.alert(
          'Erreur',
          'Impossible de mettre à jour votre programme. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Error in handleGenerateProgram:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
    }
  };

  const hasChanges = selectedLevel !== level || 
                   selectedGoal !== goal || 
                   selectedDiet !== diet || 
                   JSON.stringify(selectedDaysState.sort()) !== JSON.stringify(selectedDaysInitial.sort());

  const getDayLabel = (dayKey: string) => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Mon programme sur mesure" 
        showBackButton={true}
      />

      <ScrollView style={styles.content}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Personnalisez votre programme</Text>
          <Text style={styles.introText}>
            Modifiez vos préférences pour générer un nouveau programme d'entraînement et de nutrition adapté à vos objectifs.
          </Text>
        </View>

        {/* Niveau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niveau d'entraînement</Text>
          {levels.map((levelOption) => (
            <TouchableOpacity
              key={levelOption.value}
              style={[
                styles.option,
                selectedLevel === levelOption.value && styles.optionSelected
              ]}
              onPress={() => setSelectedLevel(levelOption.value)}
            >
              <LinearGradient
                colors={selectedLevel === levelOption.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <levelOption.icon size={24} color={selectedLevel === levelOption.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedLevel === levelOption.value && styles.optionTitleSelected
                ]}>
                  {levelOption.title}
                </Text>
                <Text style={styles.optionDescription}>{levelOption.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Objectif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectif principal</Text>
          {goals.map((goalOption) => (
            <TouchableOpacity
              key={goalOption.value}
              style={[
                styles.option,
                selectedGoal === goalOption.value && styles.optionSelected
              ]}
              onPress={() => setSelectedGoal(goalOption.value)}
            >
              <LinearGradient
                colors={selectedGoal === goalOption.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <goalOption.icon size={24} color={selectedGoal === goalOption.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedGoal === goalOption.value && styles.optionTitleSelected
                ]}>
                  {goalOption.title}
                </Text>
                <Text style={styles.optionDescription}>{goalOption.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Régime alimentaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Régime alimentaire</Text>
          {diets.map((dietOption) => (
            <TouchableOpacity
              key={dietOption.value}
              style={[
                styles.option,
                selectedDiet === dietOption.value && styles.optionSelected
              ]}
              onPress={() => setSelectedDiet(dietOption.value)}
            >
              <LinearGradient
                colors={selectedDiet === dietOption.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <dietOption.icon size={24} color={selectedDiet === dietOption.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedDiet === dietOption.value && styles.optionTitleSelected
                ]}>
                  {dietOption.title}
                </Text>
                <Text style={styles.optionDescription}>{dietOption.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sélection des jours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sélectionnez vos jours d'entraînement</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedDaysState.length} jour{selectedDaysState.length > 1 ? 's' : ''} sélectionné{selectedDaysState.length > 1 ? 's' : ''} • Choisissez librement vos jours
          </Text>
          
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDaysState.includes(day.key) && styles.dayButtonSelected,
                  day.key === currentDay && !selectedDaysState.includes(day.key) && styles.dayButtonToday
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <View style={styles.dayButtonContent}>
                  <View style={styles.dayButtonHeader}>
                    <Text style={[
                      styles.dayButtonShort,
                      selectedDaysState.includes(day.key) && styles.dayButtonTextSelected,
                      day.key === currentDay && !selectedDaysState.includes(day.key) && styles.dayButtonTextToday
                    ]}>
                      {day.short}
                    </Text>
                    {selectedDaysState.includes(day.key) && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                    {day.key === currentDay && !selectedDaysState.includes(day.key) && (
                      <View style={styles.todayIndicator}>
                        <View style={styles.todayDot} />
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.dayButtonLabel,
                    selectedDaysState.includes(day.key) && styles.dayButtonTextSelected,
                    day.key === currentDay && !selectedDaysState.includes(day.key) && styles.dayButtonTextToday
                  ]}>
                    {day.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedDaysState.length > 0 && (
            <View style={styles.selectedDaysPreview}>
              <Text style={styles.previewTitle}>Jours sélectionnés :</Text>
              <Text style={styles.previewText}>
                {selectedDaysState.map(getDayLabel).join(', ')}
              </Text>
              <Text style={styles.previewFrequency}>
                Fréquence : {selectedDaysState.length} jour{selectedDaysState.length > 1 ? 's' : ''} par semaine
              </Text>
            </View>
          )}
        </View>

        {/* Bouton de génération */}
        <View style={styles.generateSection}>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!hasChanges || loading || selectedDaysState.length === 0) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateProgram}
            disabled={!hasChanges || loading || selectedDaysState.length === 0}
          >
            <LinearGradient
              colors={!hasChanges || loading || selectedDaysState.length === 0 ? ['#CCCCCC', '#AAAAAA'] : ['#28A745', '#20C997']}
              style={styles.generateButtonGradient}
            >
              <RefreshCw size={24} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>
                {loading ? 'Génération en cours...' : 
                 hasChanges ? 'Générer mon nouveau programme' : 
                 'Aucune modification détectée'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {hasChanges && (
            <Text style={styles.generateHint}>
              Votre programme sera mis à jour selon vos nouvelles préférences
            </Text>
          )}
        </View>
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
  },
  introSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionSelected: {
    borderColor: '#6EC1E4',
    backgroundColor: '#F8FCFF',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  optionTitleSelected: {
    color: '#6EC1E4',
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  dayButton: {
    width: '13.5%',
    aspectRatio: 1,
    minWidth: 45,
    maxWidth: 55,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButtonSelected: {
    backgroundColor: '#6EC1E4',
    borderColor: '#6EC1E4',
    shadowColor: '#6EC1E4',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  dayButtonToday: {
    borderColor: '#FFA726',
    backgroundColor: '#FFF8E1',
    shadowColor: '#FFA726',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  dayButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  dayButtonHeader: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayButtonShort: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#4A5568',
    fontWeight: '800',
  },
  dayButtonLabel: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 11,
    fontWeight: '600',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  dayButtonTextToday: {
    color: '#F57C00',
    fontWeight: '700',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#28A745',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#28A745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  checkMark: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  todayIndicator: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA726',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFA726',
  },
  selectedDaysPreview: {
    backgroundColor: '#E8F6FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#6EC1E4',
    marginBottom: 4,
  },
  previewFrequency: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
  generateSection: {
    padding: 20,
    paddingBottom: 40,
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
    textAlign: 'center',
  },
  generateHint: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});