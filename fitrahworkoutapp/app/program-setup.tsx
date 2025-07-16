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
import { Target, Zap, TrendingUp, Award, Utensils, Leaf, Wheat, Heart, Calendar, Sparkles } from 'lucide-react-native';
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

export default function ProgramSetupScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { name } = useSelector((state: RootState) => state.user);
  const { generateNewProgram, loading, checkExistingProgram } = useProgramGeneration();
  
  // Utiliser les préférences existantes de l'utilisateur ou des valeurs par défaut
  const userState = useSelector((state: RootState) => state.user);
  const [selectedLevel, setSelectedLevel] = useState<'Débutant' | 'Intermédiaire' | 'Avancé'>(userState.level || 'Débutant');
  const [selectedGoal, setSelectedGoal] = useState<'Perdre du poids' | 'Prise de muscle' | 'Performance'>(userState.goal || 'Perdre du poids');
  const [selectedDiet, setSelectedDiet] = useState<'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten'>(userState.diet || 'Standard');
  const [selectedDays, setSelectedDays] = useState<string[]>(userState.selectedDays || getDefaultSelectedDays());
  const [autoGenerating, setAutoGenerating] = useState(false);
  const currentDay = getCurrentDayKey();

  // Fonction pour charger les préférences depuis Firestore et mettre à jour les états
  const loadUserPreferencesFromFirestore = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Chargement des préférences depuis Firestore dans program-setup...');
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('✅ Préférences trouvées dans Firestore:', {
          level: userData.level,
          goal: userData.goal,
          diet: userData.diet,
          selectedDays: userData.selectedDays});
        
        // Mettre à jour les états locaux avec les préférences Firestore
        if (userData.level) setSelectedLevel(userData.level);
        if (userData.goal) setSelectedGoal(userData.goal);
        if (userData.diet) setSelectedDiet(userData.diet);
        if (userData.selectedDays && userData.selectedDays.length > 0) {
          setSelectedDays(userData.selectedDays);
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

  // Vérifier si l'utilisateur a déjà un programme au chargement
  useEffect(() => {
    let isMounted = true; // Pour éviter les mises à jour d'état après démontage
    
    const checkExistingProgramOnMount = async () => {
      if (!user) return;
      
      try {
        console.log('🔍 Vérification du programme existant dans program-setup...');
        const { hasProgram } = await checkExistingProgram();
        
        if (hasProgram) {
          if (!isMounted) return;
          console.log('⚠️ Programme existant détecté - redirection vers les tabs');
          router.replace('/(tabs)');
          return;
        }
        
        // Charger les préférences depuis Firestore si elles ne sont pas en mémoire
        if (!userState.level || !userState.goal || !userState.diet) {
          console.log('🔄 Chargement des préférences manquantes...');
          await loadUserPreferencesFromFirestore();
        }
        
        // Aucun programme trouvé - vérifier si on peut générer automatiquement
        // Utiliser les états locaux mis à jour
        const hasCompletePreferences = selectedLevel && 
                                      selectedGoal && 
                                      selectedDiet && 
                                      selectedDays.length > 0;
        
        if (hasCompletePreferences && userState.isOnboarded) {
          if (!isMounted) return;
          console.log('🎯 Génération automatique du programme avec les préférences existantes...');
          setAutoGenerating(true);
          
          const preferences = {
            level: selectedLevel,
            goal: selectedGoal,
            diet: selectedDiet,
            selectedDays: selectedDays,
            daysPerWeek: selectedDays.length,
          };
          
          try {
            const result = await generateNewProgram(preferences);
            if (result.success) {
              if (!isMounted) return;
              console.log('✅ Programme généré automatiquement avec succès');
              router.replace('/(tabs)');
            } else {
              if (!isMounted) return;
              console.log('❌ Échec de la génération automatique, affichage du formulaire');
              setAutoGenerating(false);
            }
          } catch (error) {
            console.error('❌ Erreur lors de la génération automatique:', error);
            if (isMounted) setAutoGenerating(false);
          }
        } else {
          console.log('📝 Préférences incomplètes ou utilisateur non onboardé, affichage du formulaire');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du programme:', error);
        if (isMounted) setAutoGenerating(false);
      }
    };

    checkExistingProgramOnMount();
    
    return () => {
      isMounted = false;
    };
  }, [user?.uid, userState.isOnboarded]); // Dépendances stables uniquement

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
    setSelectedDays(prev => {
      if (prev.includes(dayKey)) {
        // Retirer le jour et maintenir l'ordre
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
    if (selectedDays.length === 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner au moins un jour d\'entraînement dans la semaine');
      return;
    }

    if (selectedDays.length > 7) {
      Alert.alert('Erreur', 'Vous ne pouvez pas sélectionner plus de 7 jours');
      return;
    }

    try {
      const preferences = {
        level: selectedLevel,
        goal: selectedGoal,
        diet: selectedDiet,
        selectedDays: selectedDays,
        daysPerWeek: selectedDays.length,
      };

      const result = await generateNewProgram(preferences);

      if (result.success) {
        // Mettre à jour les préférences utilisateur dans Redux
        dispatch(setUserData({
          level: selectedLevel,
          goal: selectedGoal,
          diet: selectedDiet,
          selectedDays: selectedDays,
          daysPerWeek: selectedDays.length,
          updatedAt: new Date().toISOString(),
        }));

        Alert.alert(
          'Programme créé ! 🎉',
          'Votre programme personnalisé a été généré avec succès. Vous pouvez maintenant commencer votre parcours fitness !'
        );
        
        // Redirection automatique vers les tabs
        console.log('✅ Programme créé avec succès, redirection vers tabs');
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Erreur',
          'Impossible de générer votre programme. Veuillez vérifier que la base de données contient des exercices et recettes, puis réessayer.'
        );
      }
    } catch (error) {
      console.error('Error in handleGenerateProgram:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
    }
  };

  const getDayLabel = (dayKey: string) => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  // Afficher un écran de chargement pendant la génération automatique
  if (autoGenerating) {
    return (
      <View style={styles.container}>
        <AppHeader 
          title="Génération de votre programme..." 
          subtitle="Nous créons votre programme personnalisé selon vos préférences"
        />
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            ⚡ Création de votre programme d'entraînement et de nutrition...
          </Text>
          <Text style={styles.loadingSubtext}>
            Cela ne prendra que quelques secondes
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Créons votre programme !" 
        subtitle={`Bonjour ${name || 'Champion'} ! Quelques questions pour personnaliser votre expérience.`}
      />

      <ScrollView style={styles.content}>
        {/* Niveau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quel est votre niveau ?</Text>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.option,
                selectedLevel === level.value && styles.optionSelected
              ]}
              onPress={() => setSelectedLevel(level.value)}
            >
              <LinearGradient
                colors={selectedLevel === level.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <level.icon size={24} color={selectedLevel === level.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedLevel === level.value && styles.optionTitleSelected
                ]}>
                  {level.title}
                </Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Objectif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quel est votre objectif ?</Text>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.value}
              style={[
                styles.option,
                selectedGoal === goal.value && styles.optionSelected
              ]}
              onPress={() => setSelectedGoal(goal.value)}
            >
              <LinearGradient
                colors={selectedGoal === goal.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <goal.icon size={24} color={selectedGoal === goal.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedGoal === goal.value && styles.optionTitleSelected
                ]}>
                  {goal.title}
                </Text>
                <Text style={styles.optionDescription}>{goal.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Régime alimentaire */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quel régime suivez-vous ?</Text>
          {diets.map((diet) => (
            <TouchableOpacity
              key={diet.value}
              style={[
                styles.option,
                selectedDiet === diet.value && styles.optionSelected
              ]}
              onPress={() => setSelectedDiet(diet.value)}
            >
              <LinearGradient
                colors={selectedDiet === diet.value ? ['#6EC1E4', '#4A90E2'] : ['#F8F9FA', '#F8F9FA']}
                style={styles.optionIcon}
              >
                <diet.icon size={24} color={selectedDiet === diet.value ? "#FFFFFF" : "#6EC1E4"} />
              </LinearGradient>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  selectedDiet === diet.value && styles.optionTitleSelected
                ]}>
                  {diet.title}
                </Text>
                <Text style={styles.optionDescription}>{diet.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sélection des jours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sélectionnez vos jours d'entraînement</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} sélectionné{selectedDays.length > 1 ? 's' : ''} • Choisissez librement vos jours
          </Text>
          
          <View style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.key) && styles.dayButtonSelected,
                  day.key === currentDay && !selectedDays.includes(day.key) && styles.dayButtonToday
                ]}
                onPress={() => toggleDay(day.key)}
              >
                <View style={styles.dayButtonContent}>
                  <View style={styles.dayButtonHeader}>
                    <Text style={[
                      styles.dayButtonShort,
                      selectedDays.includes(day.key) && styles.dayButtonTextSelected,
                      day.key === currentDay && !selectedDays.includes(day.key) && styles.dayButtonTextToday
                    ]}>
                      {day.short}
                    </Text>
                    {selectedDays.includes(day.key) && (
                      <View style={styles.selectedIndicator}>
                        <Text style={styles.checkMark}>✓</Text>
                      </View>
                    )}
                    {day.key === currentDay && !selectedDays.includes(day.key) && (
                      <View style={styles.todayIndicator}>
                        <View style={styles.todayDot} />
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.dayButtonLabel,
                    selectedDays.includes(day.key) && styles.dayButtonTextSelected,
                    day.key === currentDay && !selectedDays.includes(day.key) && styles.dayButtonTextToday
                  ]}>
                    {day.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedDays.length > 0 && (
            <View style={styles.selectedDaysPreview}>
              <Text style={styles.previewTitle}>Jours sélectionnés :</Text>
              <Text style={styles.previewText}>
                {selectedDays.map(getDayLabel).join(', ')}
              </Text>
              <Text style={styles.previewFrequency}>
                Fréquence : {selectedDays.length} jour{selectedDays.length > 1 ? 's' : ''} par semaine
              </Text>
            </View>
          )}
        </View>

        {/* Bouton de génération */}
        <View style={styles.generateSection}>
          <TouchableOpacity
            style={[
              styles.generateButton, 
              (loading || autoGenerating || selectedDays.length === 0) && styles.generateButtonDisabled
            ]}
            onPress={handleGenerateProgram}
            disabled={loading || autoGenerating || selectedDays.length === 0}
          >
            <LinearGradient
              colors={loading || autoGenerating || selectedDays.length === 0 ? ['#CCCCCC', '#AAAAAA'] : ['#28A745', '#20C997']}
              style={styles.generateButtonGradient}
            >
              <Sparkles size={24} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>
                {loading || autoGenerating ? 'Génération en cours...' : 'Créer mon programme ! 🚀'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.generateHint}>
            Votre programme sera personnalisé selon vos préférences et sauvegardé automatiquement.
          </Text>
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
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
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
  daysContainer: {
    paddingHorizontal: 4,
  },
  daysScroll: {
    flexDirection: 'row',
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 24,
  },
  dayButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dayButtonSelected: {
    shadowColor: '#6EC1E4',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  dayButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  dayButtonShort: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#4A5568',
    marginBottom: 4,
  },
  dayButtonLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-Medium',
    color: '#718096',
    textAlign: 'center',
    lineHeight: 12,
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
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
    marginBottom: 16,
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
    fontSize: 18,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
  },
});