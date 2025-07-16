import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';

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

export default function OnboardingSchedule() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [selectedDays, setSelectedDays] = useState<string[]>(getDefaultSelectedDays());
  const currentDay = getCurrentDayKey();

  const toggleDay = (dayKey: string) => {
    setSelectedDays(prev => {
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

  const handleContinue = () => {
    if (selectedDays.length === 0) {
      return; // Ne pas continuer si aucun jour n'est sélectionné
    }

    dispatch(setUserData({ 
      daysPerWeek: selectedDays.length,
      selectedDays 
    }));
    router.push('/onboarding/complete');
  };

  const getDayLabel = (dayKey: string) => {
    return DAYS_OF_WEEK.find(d => d.key === dayKey)?.label || dayKey;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <ArrowLeft size={24} color="#6EC1E4" />
      </TouchableOpacity>

      <Text style={styles.title}>Quels jours voulez-vous vous entraîner ?</Text>
      <Text style={styles.subtitle}>
        Sélectionnez vos jours d'entraînement dans la semaine
      </Text>

      <View style={styles.optionsContainer}>
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
              activeOpacity={0.7}
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

        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedDays.length === 0 && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={selectedDays.length === 0}
        >
          <LinearGradient
            colors={selectedDays.length === 0 ? ['#CCCCCC', '#AAAAAA'] : ['#6EC1E4', '#4A90E2']}
            style={styles.continueButtonGradient}
          >
            <Text style={styles.continueButtonText}>
              Continuer
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressText}>4 / 4</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
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
    borderRadius: 16,
    marginBottom: 16,
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
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
  },
  progress: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6EC1E4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#666666',
  },
});