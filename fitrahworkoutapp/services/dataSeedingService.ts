import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Service pour peupler la base de données avec des exercices et recettes
export const dataSeedingService = {
  // Vérifier si les données existent déjà
  async checkIfDataExists() {
    try {
      const exercisesQuery = query(collection(db, 'exercises'), limit(1));
      const recipesQuery = query(collection(db, 'recipes'), limit(1));
      
      const [exercisesSnapshot, recipesSnapshot] = await Promise.all([
        getDocs(exercisesQuery),
        getDocs(recipesQuery)
      ]);
      
      return {
        exercisesExist: !exercisesSnapshot.empty,
        recipesExist: !recipesSnapshot.empty
      };
    } catch (error) {
      console.error('Error checking existing data:', error);
      return { exercisesExist: false, recipesExist: false };
    }
  },

  // Ajouter les exercices par défaut
  async seedExercises() {
    try {
      console.log('🏋️‍♂️ Ajout des exercices par défaut...');
      
      const exercises = [
        // PUSH - Débutant
        {
          name: 'Pompes classiques',
          description: 'Exercice de base pour développer les pectoraux, triceps et deltoïdes antérieurs',
          videoUrl: '', // Sera rempli lors de l'upload
          category: 'Push',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Pectoraux', 'Triceps', 'Deltoïdes'],
          sets: 3,
          reps: '8-12',
          tags: ['Basique', 'Fonctionnel']
        },
        {
          name: 'Pompes inclinées',
          description: 'Version facilitée des pompes, mains surélevées sur un banc',
          videoUrl: '',
          category: 'Push',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Pectoraux', 'Triceps'],
          sets: 3,
          reps: '10-15',
          tags: ['Progression', 'Débutant']
        },
        {
          name: 'Développé couché haltères',
          description: 'Exercice principal pour le développement des pectoraux',
          videoUrl: '',
          category: 'Push',
          level: 'Intermédiaire',
          equipment: 'Haltères',
          muscleGroups: ['Pectoraux', 'Triceps', 'Deltoïdes'],
          sets: 4,
          reps: '8-10',
          tags: ['Masse', 'Force']
        },
        {
          name: 'Élévations latérales',
          description: 'Isolation des deltoïdes latéraux pour élargir les épaules',
          videoUrl: '',
          category: 'Push',
          level: 'Débutant',
          equipment: 'Haltères',
          muscleGroups: ['Deltoïdes'],
          sets: 3,
          reps: '12-15',
          tags: ['Isolation', 'Épaules']
        },
        {
          name: 'Développé militaire',
          description: 'Exercice complet pour les épaules et la stabilité du tronc',
          videoUrl: '',
          category: 'Push',
          level: 'Avancé',
          equipment: 'Barre',
          muscleGroups: ['Deltoïdes', 'Triceps', 'Core'],
          sets: 4,
          reps: '6-8',
          tags: ['Force', 'Stabilité']
        },
        {
          name: 'Dips aux barres parallèles',
          description: 'Exercice avancé pour les triceps et pectoraux inférieurs',
          videoUrl: '',
          category: 'Push',
          level: 'Avancé',
          equipment: 'Poids du corps',
          muscleGroups: ['Triceps', 'Pectoraux'],
          sets: 3,
          reps: '6-10',
          tags: ['Avancé', 'Force']
        },

        // PULL - Débutant à Avancé
        {
          name: 'Tractions assistées',
          description: 'Version facilitée des tractions avec élastique ou machine',
          videoUrl: '',
          category: 'Pull',
          level: 'Débutant',
          equipment: 'Élastiques',
          muscleGroups: ['Dorsaux', 'Biceps'],
          sets: 3,
          reps: '5-8',
          tags: ['Progression', 'Assistance']
        },
        {
          name: 'Rowing haltère',
          description: 'Exercice unilatéral pour développer les dorsaux et rhomboïdes',
          videoUrl: '',
          category: 'Pull',
          level: 'Intermédiaire',
          equipment: 'Haltères',
          muscleGroups: ['Dorsaux', 'Rhomboïdes', 'Biceps'],
          sets: 4,
          reps: '8-12',
          tags: ['Unilatéral', 'Masse']
        },
        {
          name: 'Tractions pronation',
          description: 'Exercice roi pour le développement du dos et des biceps',
          videoUrl: '',
          category: 'Pull',
          level: 'Avancé',
          equipment: 'Poids du corps',
          muscleGroups: ['Dorsaux', 'Biceps', 'Rhomboïdes'],
          sets: 4,
          reps: '5-10',
          tags: ['Classique', 'Force']
        },
        {
          name: 'Tirage horizontal élastique',
          description: 'Alternative au rowing avec élastiques, parfait pour débuter',
          videoUrl: '',
          category: 'Pull',
          level: 'Débutant',
          equipment: 'Élastiques',
          muscleGroups: ['Dorsaux', 'Rhomboïdes'],
          sets: 3,
          reps: '12-15',
          tags: ['Résistance', 'Portable']
        },
        {
          name: 'Soulevé de terre',
          description: 'Exercice complet pour la chaîne postérieure',
          videoUrl: '',
          category: 'Pull',
          level: 'Avancé',
          equipment: 'Barre',
          muscleGroups: ['Dorsaux', 'Fessiers', 'Ischio-jambiers'],
          sets: 4,
          reps: '5-8',
          tags: ['Complet', 'Force']
        },

        // LEGS - Débutant à Avancé
        {
          name: 'Squats au poids du corps',
          description: 'Exercice fondamental pour les quadriceps et fessiers',
          videoUrl: '',
          category: 'Legs',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Quadriceps', 'Fessiers'],
          sets: 3,
          reps: '15-20',
          tags: ['Fondamental', 'Fonctionnel']
        },
        {
          name: 'Fentes alternées',
          description: 'Exercice unilatéral pour l\'équilibre et la force des jambes',
          videoUrl: '',
          category: 'Legs',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Quadriceps', 'Fessiers'],
          sets: 3,
          reps: '10-12 par jambe',
          tags: ['Unilatéral', 'Équilibre']
        },
        {
          name: 'Squats gobelet',
          description: 'Squats avec haltère pour ajouter de la résistance',
          videoUrl: '',
          category: 'Legs',
          level: 'Intermédiaire',
          equipment: 'Haltères',
          muscleGroups: ['Quadriceps', 'Fessiers', 'Core'],
          sets: 4,
          reps: '10-15',
          tags: ['Progression', 'Stabilité']
        },
        {
          name: 'Squats bulgares',
          description: 'Fentes arrière avec pied surélevé, très intense',
          videoUrl: '',
          category: 'Legs',
          level: 'Avancé',
          equipment: 'Poids du corps',
          muscleGroups: ['Quadriceps', 'Fessiers'],
          sets: 3,
          reps: '8-12 par jambe',
          tags: ['Intense', 'Unilatéral']
        },
        {
          name: 'Squats avant barre',
          description: 'Variante avancée mettant l\'accent sur les quadriceps',
          videoUrl: '',
          category: 'Legs',
          level: 'Avancé',
          equipment: 'Barre',
          muscleGroups: ['Quadriceps', 'Core'],
          sets: 4,
          reps: '6-10',
          tags: ['Technique', 'Force']
        },
        {
          name: 'Mollets debout',
          description: 'Isolation des mollets pour le développement des jambes',
          videoUrl: '',
          category: 'Legs',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Mollets'],
          sets: 4,
          reps: '15-20',
          tags: ['Isolation', 'Endurance']
        },

        // CARDIO
        {
          name: 'Burpees',
          description: 'Exercice complet alliant cardio et renforcement musculaire',
          videoUrl: '',
          category: 'Cardio',
          level: 'Intermédiaire',
          equipment: 'Poids du corps',
          muscleGroups: ['Corps entier'],
          sets: 3,
          reps: '8-12',
          tags: ['HIIT', 'Complet']
        },
        {
          name: 'Mountain climbers',
          description: 'Exercice cardio intense pour le core et les jambes',
          videoUrl: '',
          category: 'Cardio',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Core', 'Jambes'],
          sets: 3,
          reps: '30 secondes',
          tags: ['Cardio', 'Core']
        },
        {
          name: 'Jumping jacks',
          description: 'Exercice cardio simple pour l\'échauffement',
          videoUrl: '',
          category: 'Cardio',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Corps entier'],
          sets: 3,
          reps: '30 secondes',
          tags: ['Échauffement', 'Simple']
        },
        {
          name: 'Sprint sur place',
          description: 'Course intensive sur place pour le cardio',
          videoUrl: '',
          category: 'Cardio',
          level: 'Intermédiaire',
          equipment: 'Poids du corps',
          muscleGroups: ['Jambes', 'Core'],
          sets: 4,
          reps: '20 secondes',
          tags: ['Intense', 'HIIT']
        },

        // CORE
        {
          name: 'Planche',
          description: 'Exercice isométrique pour renforcer tout le core',
          videoUrl: '',
          category: 'Core',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Core', 'Épaules'],
          sets: 3,
          reps: '30-60 secondes',
          tags: ['Isométrique', 'Stabilité']
        },
        {
          name: 'Crunchs',
          description: 'Exercice classique pour les abdominaux',
          videoUrl: '',
          category: 'Core',
          level: 'Débutant',
          equipment: 'Poids du corps',
          muscleGroups: ['Abdominaux'],
          sets: 3,
          reps: '15-20',
          tags: ['Classique', 'Isolation']
        },
        {
          name: 'Russian twists',
          description: 'Rotation du tronc pour les obliques',
          videoUrl: '',
          category: 'Core',
          level: 'Intermédiaire',
          equipment: 'Poids du corps',
          muscleGroups: ['Obliques', 'Core'],
          sets: 3,
          reps: '20-30',
          tags: ['Rotation', 'Obliques']
        },
        {
          name: 'Dead bug',
          description: 'Exercice de stabilité pour le core profond',
          videoUrl: '',
          category: 'Core',
          level: 'Intermédiaire',
          equipment: 'Poids du corps',
          muscleGroups: ['Core profond'],
          sets: 3,
          reps: '10 par côté',
          tags: ['Stabilité', 'Contrôle']
        }
      ];

      // Ajouter chaque exercice à Firestore
      for (const exercise of exercises) {
        await addDoc(collection(db, 'exercises'), {
          ...exercise,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      console.log(`✅ ${exercises.length} exercices ajoutés avec succès`);
      return { success: true, count: exercises.length };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des exercices:', error);
      return { success: false, error };
    }
  },

  // Ajouter les recettes par défaut
  async seedRecipes() {
    try {
      console.log('🍽️ Ajout des recettes par défaut...');
      
      const recipes = [
        // PETIT-DÉJEUNER
        {
          name: 'Avoine aux fruits rouges',
          ingredients: ['100g flocons d\'avoine', '250ml lait d\'amande', '100g myrtilles', '1 banane', '1 cuillère miel'],
          instructions: 'Faire chauffer le lait d\'amande. Ajouter l\'avoine et cuire 5 minutes. Incorporer les fruits et le miel.',
          cookTime: 10,
          calories: 320,
          protein: 12,
          carbs: 58,
          fat: 6,
          season: 'Toute l\'année',
          diet: 'Végétarien',
          goal: 'Performance',
          mealType: 'Petit-déjeuner'
        },
        {
          name: 'Omelette protéinée',
          ingredients: ['3 œufs entiers', '2 blancs d\'œufs', '50g épinards', '30g fromage blanc', 'Herbes de Provence'],
          instructions: 'Battre les œufs. Faire revenir les épinards. Cuire l\'omelette et garnir avec le fromage blanc.',
          cookTime: 8,
          calories: 280,
          protein: 28,
          carbs: 4,
          fat: 16,
          season: 'Toute l\'année',
          diet: 'Standard',
          goal: 'Prise de muscle',
          mealType: 'Petit-déjeuner'
        },
        {
          name: 'Smoothie vert détox',
          ingredients: ['1 banane', '100g épinards frais', '200ml eau de coco', '1 cuillère spiruline', 'Jus de citron'],
          instructions: 'Mixer tous les ingrédients jusqu\'à obtenir une texture lisse. Servir frais.',
          cookTime: 5,
          calories: 180,
          protein: 8,
          carbs: 32,
          fat: 2,
          season: 'Printemps',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Petit-déjeuner'
        },
        {
          name: 'Pancakes protéinés',
          ingredients: ['2 œufs', '1 banane', '30g poudre de protéine vanille', '1 cuillère cannelle'],
          instructions: 'Écraser la banane, mélanger avec les œufs et la protéine. Cuire comme des pancakes.',
          cookTime: 12,
          calories: 350,
          protein: 32,
          carbs: 28,
          fat: 8,
          season: 'Toute l\'année',
          diet: 'Sans gluten',
          goal: 'Prise de muscle',
          mealType: 'Petit-déjeuner'
        },

        // DÉJEUNER
        {
          name: 'Salade de quinoa méditerranéenne',
          ingredients: ['150g quinoa cuit', '100g tomates cerises', '50g concombre', '50g feta', '20g olives noires', 'Huile d\'olive'],
          instructions: 'Cuire le quinoa. Couper les légumes. Mélanger tous les ingrédients et assaisonner.',
          cookTime: 20,
          calories: 420,
          protein: 18,
          carbs: 52,
          fat: 16,
          season: 'Été',
          diet: 'Végétarien',
          goal: 'Performance',
          mealType: 'Déjeuner'
        },
        {
          name: 'Bowl de riz aux légumes',
          ingredients: ['150g riz complet', '100g brocolis', '80g carottes', '60g edamame', 'Sauce soja', 'Graines de sésame'],
          instructions: 'Cuire le riz. Faire sauter les légumes. Assembler le bowl et assaisonner.',
          cookTime: 25,
          calories: 380,
          protein: 14,
          carbs: 68,
          fat: 8,
          season: 'Toute l\'année',
          diet: 'Vegan',
          goal: 'Performance',
          mealType: 'Déjeuner'
        },
        {
          name: 'Wrap au poulet grillé',
          ingredients: ['1 tortilla complète', '120g blanc de poulet', '50g salade', '30g avocat', '20g tomates', 'Yaourt grec'],
          instructions: 'Griller le poulet. Garnir la tortilla avec tous les ingrédients et rouler.',
          cookTime: 15,
          calories: 450,
          protein: 35,
          carbs: 32,
          fat: 18,
          season: 'Toute l\'année',
          diet: 'Standard',
          goal: 'Prise de muscle',
          mealType: 'Déjeuner'
        },
        {
          name: 'Soupe de lentilles épicée',
          ingredients: ['200g lentilles corail', '100g carottes', '50g oignons', 'Lait de coco', 'Épices curry', 'Bouillon légumes'],
          instructions: 'Faire revenir les légumes. Ajouter les lentilles et le bouillon. Mijoter 20 minutes.',
          cookTime: 30,
          calories: 320,
          protein: 18,
          carbs: 48,
          fat: 8,
          season: 'Automne',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Déjeuner'
        },

        // DÎNER
        {
          name: 'Saumon grillé aux légumes',
          ingredients: ['150g filet de saumon', '200g courgettes', '150g brocolis', 'Huile d\'olive', 'Citron', 'Herbes de Provence'],
          instructions: 'Griller le saumon. Faire sauter les légumes. Servir avec un filet de citron.',
          cookTime: 20,
          calories: 380,
          protein: 35,
          carbs: 12,
          fat: 22,
          season: 'Toute l\'année',
          diet: 'Standard',
          goal: 'Prise de muscle',
          mealType: 'Dîner'
        },
        {
          name: 'Curry de pois chiches',
          ingredients: ['200g pois chiches', '100ml lait de coco', '80g épinards', '50g oignons', 'Épices curry', 'Tomates concassées'],
          instructions: 'Faire revenir les oignons. Ajouter les épices, puis les pois chiches et le lait de coco. Mijoter 15 minutes.',
          cookTime: 25,
          calories: 350,
          protein: 16,
          carbs: 45,
          fat: 12,
          season: 'Hiver',
          diet: 'Vegan',
          goal: 'Performance',
          mealType: 'Dîner'
        },
        {
          name: 'Escalope de dinde aux champignons',
          ingredients: ['150g escalope de dinde', '150g champignons de Paris', '100g haricots verts', 'Crème fraîche allégée', 'Échalotes'],
          instructions: 'Cuire la dinde. Faire sauter les champignons et légumes. Lier avec la crème.',
          cookTime: 18,
          calories: 320,
          protein: 32,
          carbs: 8,
          fat: 16,
          season: 'Automne',
          diet: 'Standard',
          goal: 'Perte de poids',
          mealType: 'Dîner'
        },
        {
          name: 'Ratatouille provençale',
          ingredients: ['100g aubergines', '100g courgettes', '100g poivrons', '80g tomates', 'Huile d\'olive', 'Herbes de Provence'],
          instructions: 'Couper tous les légumes. Les faire mijoter ensemble avec les herbes pendant 30 minutes.',
          cookTime: 35,
          calories: 180,
          protein: 4,
          carbs: 24,
          fat: 8,
          season: 'Été',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Dîner'
        },

        // COLLATIONS
        {
          name: 'Energy balls cacao',
          ingredients: ['100g dattes', '50g amandes', '20g cacao en poudre', '1 cuillère huile de coco'],
          instructions: 'Mixer tous les ingrédients. Former des boules et réfrigérer 1 heure.',
          cookTime: 15,
          calories: 280,
          protein: 8,
          carbs: 32,
          fat: 14,
          season: 'Toute l\'année',
          diet: 'Vegan',
          goal: 'Performance',
          mealType: 'Collation'
        },
        {
          name: 'Yaourt grec aux noix',
          ingredients: ['200g yaourt grec 0%', '30g noix', '1 cuillère miel', 'Cannelle'],
          instructions: 'Mélanger le yaourt avec le miel. Ajouter les noix concassées et la cannelle.',
          cookTime: 3,
          calories: 250,
          protein: 20,
          carbs: 18,
          fat: 12,
          season: 'Toute l\'année',
          diet: 'Végétarien',
          goal: 'Prise de muscle',
          mealType: 'Collation'
        },
        {
          name: 'Smoothie protéiné chocolat',
          ingredients: ['250ml lait d\'amande', '30g protéine chocolat', '1 banane', '1 cuillère beurre d\'amande'],
          instructions: 'Mixer tous les ingrédients jusqu\'à obtenir une texture crémeuse.',
          cookTime: 5,
          calories: 320,
          protein: 28,
          carbs: 24,
          fat: 12,
          season: 'Toute l\'année',
          diet: 'Végétarien',
          goal: 'Prise de muscle',
          mealType: 'Collation'
        },
        {
          name: 'Houmous aux légumes',
          ingredients: ['100g houmous', '100g carottes', '80g concombre', '60g poivrons'],
          instructions: 'Couper les légumes en bâtonnets. Servir avec le houmous.',
          cookTime: 5,
          calories: 180,
          protein: 8,
          carbs: 20,
          fat: 8,
          season: 'Toute l\'année',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Collation'
        },

        // RECETTES SAISONNIÈRES
        {
          name: 'Soupe de potiron',
          ingredients: ['400g potiron', '100ml lait de coco', '50g oignons', 'Gingembre', 'Bouillon légumes'],
          instructions: 'Faire revenir les oignons. Ajouter le potiron et le bouillon. Cuire 25 minutes et mixer.',
          cookTime: 30,
          calories: 160,
          protein: 4,
          carbs: 28,
          fat: 6,
          season: 'Automne',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Dîner'
        },
        {
          name: 'Salade d\'été aux fruits',
          ingredients: ['100g roquette', '150g melon', '100g pastèque', '50g feta', '20g menthe fraîche', 'Vinaigrette légère'],
          instructions: 'Couper les fruits. Mélanger avec la roquette et la feta. Assaisonner.',
          cookTime: 10,
          calories: 220,
          protein: 8,
          carbs: 32,
          fat: 8,
          season: 'Été',
          diet: 'Végétarien',
          goal: 'Perte de poids',
          mealType: 'Déjeuner'
        },
        {
          name: 'Potage de légumes d\'hiver',
          ingredients: ['150g poireaux', '100g carottes', '100g navets', '80g pommes de terre', 'Bouillon légumes'],
          instructions: 'Couper tous les légumes. Les faire mijoter dans le bouillon 25 minutes.',
          cookTime: 30,
          calories: 140,
          protein: 4,
          carbs: 28,
          fat: 2,
          season: 'Hiver',
          diet: 'Vegan',
          goal: 'Perte de poids',
          mealType: 'Dîner'
        },
        {
          name: 'Salade printanière aux radis',
          ingredients: ['100g jeunes pousses', '80g radis', '60g petits pois', '50g fromage de chèvre', 'Vinaigrette moutarde'],
          instructions: 'Nettoyer les légumes. Mélanger avec le fromage et assaisonner.',
          cookTime: 8,
          calories: 200,
          protein: 12,
          carbs: 16,
          fat: 10,
          season: 'Printemps',
          diet: 'Végétarien',
          goal: 'Performance',
          mealType: 'Déjeuner'
        }
      ];

      // Ajouter chaque recette à Firestore
      for (const recipe of recipes) {
        await addDoc(collection(db, 'recipes'), {
          ...recipe,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      console.log(`✅ ${recipes.length} recettes ajoutées avec succès`);
      return { success: true, count: recipes.length };
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout des recettes:', error);
      return { success: false, error };
    }
  },

  // Fonction principale pour peupler la base de données
  async seedDatabase() {
    try {
      console.log('🌱 Vérification et peuplement de la base de données...');
      
      const { exercisesExist, recipesExist } = await this.checkIfDataExists();
      
      const results = {
        exercises: { success: true, count: 0, message: 'Déjà existants' },
        recipes: { success: true, count: 0, message: 'Déjà existantes' }
      };

      if (!exercisesExist) {
        results.exercises = await this.seedExercises();
        results.exercises.message = 'Ajoutés avec succès';
      }

      if (!recipesExist) {
        results.recipes = await this.seedRecipes();
        results.recipes.message = 'Ajoutées avec succès';
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('❌ Erreur lors du peuplement:', error);
      return { success: false, error };
    }
  }
};