import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RefreshCw, Clock } from 'lucide-react-native';

interface MealCardProps {
  meal: {
    id: string;
    name: string;
    type: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    cookTime: number;
    dietTags: string[];
  };
  onReplace: (id: string) => void;
}

export default function MealCard({ meal, onReplace }: MealCardProps) {
  const mealTypeIcons = {
    'Petit-déjeuner': '🌅',
    'Déjeuner': '🍽️',
    'Dîner': '🌙',
    'Collation': '🍎',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>
          {mealTypeIcons[meal.type]} {meal.type}
        </Text>
        <Text style={styles.calories}>{meal.calories} cal</Text>
      </View>
      
      <Text style={styles.name}>{meal.name}</Text>
      
      <View style={styles.macros}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.protein}g</Text>
          <Text style={styles.macroLabel}>Protéines</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.carbs}g</Text>
          <Text style={styles.macroLabel}>Glucides</Text>
        </View>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.fat}g</Text>
          <Text style={styles.macroLabel}>Lipides</Text>
        </View>
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Clock size={16} color="#666666" />
          <Text style={styles.infoText}>{meal.cookTime} min</Text>
        </View>
        <View style={styles.dietTags}>
          {meal.dietTags.map((tag, index) => (
            <View key={index} style={styles.dietTag}>
              <Text style={styles.dietTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.replaceButton}
        onPress={() => onReplace(meal.id)}
      >
        <RefreshCw size={16} color="#6EC1E4" />
        <Text style={styles.replaceButtonText}>Remplacer ce repas</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#28A745',
  },
  calories: {
    fontSize: 14,
    fontFamily: 'Montserrat-Bold',
    color: '#666666',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
  },
  macroLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  info: {
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
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  dietTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dietTag: {
    backgroundColor: '#E8F6FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  dietTagText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#6EC1E4',
  },
  replaceButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6EC1E4',
    marginLeft: 8,
  },
});