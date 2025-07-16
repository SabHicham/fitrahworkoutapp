import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setDuration, startTimer, pauseTimer, resetTimer, tick } from '@/store/slices/timerSlice';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react-native';
import { useEffect } from 'react';

export default function TimerScreen() {
  const dispatch = useDispatch();
  const { duration, timeRemaining, isActive, isPaused, presetTimes } = useSelector((state: RootState) => state.timer);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, dispatch]);

  const handleStart = () => {
    dispatch(startTimer());
  };

  const handlePause = () => {
    dispatch(pauseTimer());
  };

  const handleReset = () => {
    dispatch(resetTimer());
  };

  const handleSetDuration = (seconds: number) => {
    dispatch(setDuration(seconds));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeRemaining / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Compact Header */}
      <LinearGradient
        colors={['#6EC1E4', '#4A90E2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerOverlay} />
        <Text style={styles.title}>Minuteur</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Timer Display */}
        <View style={styles.timerSection}>
          <View style={styles.timerContainer}>
            <View style={styles.timerShadow} />
            <View style={styles.timerCircle}>
              <View style={styles.timerGlow} />
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.timerLabel}>
                {isActive ? (isPaused ? 'Pause' : 'Actif') : 'Prêt'}
              </Text>
            </View>
            
            {/* Progress Ring */}
            <View style={styles.progressRing}>
              <View style={styles.progressRingGlow} />
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>

        {/* Main Controls */}
        <View style={styles.controlsSection}>
          <View style={styles.mainControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <View style={styles.controlButtonGlow} />
              <RotateCcw size={20} color="#6EC1E4" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={isActive && !isPaused ? handlePause : handleStart}
              activeOpacity={0.8}
            >
              <View style={styles.playButtonShadow} />
              <LinearGradient
                colors={isActive && !isPaused ? ['#DC3545', '#C82333'] : ['#28A745', '#20C997']}
                style={styles.playButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isActive && !isPaused ? (
                  <Pause size={24} color="#FFFFFF" />
                ) : (
                  <Play size={24} color="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => handleSetDuration(Math.max(30, duration - 30))}
              activeOpacity={0.7}
            >
              <View style={styles.controlButtonGlow} />
              <Minus size={20} color="#6EC1E4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact Preset Times */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetsTitle}>Durées rapides</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.presetScrollContent}
          >
            {presetTimes.map((time, index) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.presetButton,
                  duration === time && styles.presetButtonActive
                ]}
                onPress={() => handleSetDuration(time)}
                activeOpacity={0.8}
              >
                <View style={styles.presetButtonShadow} />
                <Text style={[
                  styles.presetButtonText,
                  duration === time && styles.presetButtonTextActive
                ]}>
                  {time < 60 ? `${time}s` : 
                   index === 2 ? `1m30` : 
                   `${Math.floor(time / 60)}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Custom Duration Controls */}
        <View style={styles.customSection}>
          <Text style={styles.customTitle}>Personnaliser</Text>
          <View style={styles.customControls}>
            <View style={styles.customControlsGlow} />
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => handleSetDuration(Math.max(30, duration - 30))}
              activeOpacity={0.7}
            >
              <Minus size={18} color="#6EC1E4" />
            </TouchableOpacity>
            
            <View style={styles.customValueContainer}>
              <Text style={styles.customValue}>{formatTime(duration)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.customButton}
              onPress={() => handleSetDuration(Math.min(1800, duration + 30))}
              activeOpacity={0.7}
            >
              <Plus size={18} color="#6EC1E4" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Compact Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsSectionGlow} />
          <Text style={styles.tipsTitle}>💡 Temps de repos recommandés</Text>
          <View style={styles.tipsGrid}>
            <View style={styles.tipItem}>
              <Text style={styles.tipLabel}>Hypertrophie</Text>
              <Text style={styles.tipValue}>60–90 sec</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipLabel}>Force</Text>
              <Text style={styles.tipValue}>2–5 min</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipLabel}>Endurance</Text>
              <Text style={styles.tipValue}>30–60 sec</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipLabel}>HIIT/Circuit</Text>
              <Text style={styles.tipValue}>15–45 sec</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 21,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    fontWeight: '800',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  timerSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  timerShadow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 100,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(110, 193, 228, 0.1)',
  },
  timerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.03)',
    borderRadius: 100,
  },
  timerText: {
    fontSize: 38,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginBottom: 4,
    fontWeight: '900',
  },
  timerLabel: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    fontWeight: '600',
  },
  progressRing: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: 8,
    height: 6,
    backgroundColor: 'rgba(233, 236, 239, 0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressRingGlow: {
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.2)',
  },
  controlButtonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderRadius: 25,
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    position: 'relative',
  },
  playButtonShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderRadius: 35,
  },
  playButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presetsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  presetsTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '700',
  },
  presetScrollContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.2)',
    position: 'relative',
    overflow: 'hidden',
    minWidth: 60,
    alignItems: 'center',
  },
  presetButtonShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 16,
  },
  presetButtonActive: {
    backgroundColor: '#6EC1E4',
    borderColor: '#6EC1E4',
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  presetButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    fontWeight: '700',
  },
  presetButtonTextActive: {
    color: '#FFFFFF',
  },
  customSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  customTitle: {
    fontSize: 17,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '700',
  },
  customControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    gap: 20,
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.1)',
  },
  customControlsGlow: {
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
  customButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(110, 193, 228, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(110, 193, 228, 0.3)',
  },
  customValueContainer: {
    minWidth: 80,
    alignItems: 'center',
  },
  customValue: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    fontWeight: '800',
  },
  tipsSection: {
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: 'rgba(110, 193, 228, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(110, 193, 228, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  tipsSectionGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(110, 193, 228, 0.05)',
    borderRadius: 16,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
    fontWeight: '700',
  },
  tipsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipItem: {
    flex: 1,
    alignItems: 'center',
  },
  tipLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 4,
  },
  tipValue: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#6EC1E4',
    fontWeight: '800',
  },
});