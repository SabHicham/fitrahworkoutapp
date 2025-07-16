import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircleCheck as CheckCircle, Circle, Timer, Video } from 'lucide-react-native';

interface ExerciseCardProps {
  exercise: {
    id: string;
    name: string;
    sets: number;
    reps: string;
    completed: boolean;
    description: string;
  };
  onToggleCompletion: (id: string) => void;
}

export default function ExerciseCard({ exercise, onToggleCompletion }: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.checkButton}
          onPress={() => onToggleCompletion(exercise.id)}
        >
          {exercise.completed ? (
            <CheckCircle size={24} color="#28A745" />
          ) : (
            <Circle size={24} color="#CED4DA" />
          )}
        </TouchableOpacity>
        
        <View style={styles.info}>
          <Text style={[
            styles.name,
            exercise.completed && styles.nameCompleted
          ]}>
            {exercise.name}
          </Text>
          <Text style={styles.reps}>
            {exercise.sets} séries × {exercise.reps} répétitions
          </Text>
          <Text style={styles.description}>
            {exercise.description}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Timer size={20} color="#6EC1E4" />
          <Text style={styles.actionButtonText}>Timer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Video size={20} color="#6EC1E4" />
          <Text style={styles.actionButtonText}>Vidéo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkButton: {
    marginRight: 16,
    marginTop: 2,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: '#666666',
  },
  reps: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    marginLeft: 8,
  },
});