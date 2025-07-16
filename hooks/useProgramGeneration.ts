import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { programGenerationService } from '@/services/programGenerationService';

interface UserPreferences {
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goal: 'Perdre du poids' | 'Prise de muscle' | 'Performance';
  diet: 'Standard' | 'Végétarien' | 'Vegan' | 'Sans gluten';
  selectedDays: string[];
  daysPerWeek: number;
}

export function useProgramGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  // Utiliser useCallback pour éviter la recréation de la fonction à chaque rendu
  const checkExistingProgram = useCallback(async () => {
    if (!user) {
      return { hasProgram: false, program: null };
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Vérification du programme existant pour:', user.uid);
      console.log('📖 Lecture du document userPrograms/' + user.uid);

      // Vérifier dans userPrograms (collection spécifique à l'utilisateur)
      const userProgramDoc = await getDoc(doc(db, 'userPrograms', user.uid));
      
      if (userProgramDoc.exists()) {
        const programData = userProgramDoc.data();
        console.log('📊 Document trouvé:', {
          exists: true,
          isActive: programData?.isActive,
          name: programData?.name,
          workoutPlan: programData?.workoutPlan?.length || 0,
          nutritionPlan: programData?.nutritionPlan?.length || 0,
          preferences: programData?.preferences
        });
        
        const hasProgram = programData?.isActive !== false; // true par défaut si pas défini
        
        if (hasProgram) {
          console.log('✅ Programme actif trouvé pour l\'utilisateur');
          const program = { id: userProgramDoc.id, ...programData };
          return { hasProgram: true, program };
        } else {
          console.log('❌ Programme trouvé mais inactif (isActive = false)');
          return { hasProgram: false, program: null };
        }
      } else {
        console.log('❌ Aucun document userPrograms/' + user.uid + ' trouvé');
        return { hasProgram: false, program: null };
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la vérification du programme:', err);
      console.error('❌ Code d\'erreur:', err.code);
      console.error('❌ Message d\'erreur:', err.message);
      setError('Erreur lors de la vérification du programme existant');
      return { hasProgram: false, program: null };
    } finally {
      setLoading(false);
    }
  }, [user]); // Dépendance stable sur user uniquement

  const generateNewProgram = useCallback(async (preferences: UserPreferences) => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return { success: false };
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🎯 Génération d\'un nouveau programme...');
      const result = await programGenerationService.generateProgram(user.uid, preferences);

      if (!result.success) {
        setError(result.error?.message || 'Erreur lors de la génération du programme');
        return { success: false };
      }

      console.log('✅ Programme généré avec succès');
      return { success: true, program: result.program };
    } catch (err: any) {
      console.error('Error generating program:', err);
      setError('Erreur lors de la génération du programme');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateExistingProgram = useCallback(async (preferences: UserPreferences) => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return { success: false };
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Mise à jour du programme existant...');
      const result = await programGenerationService.updateProgram(user.uid, preferences);

      if (!result.success) {
        setError(result.error?.message || 'Erreur lors de la mise à jour du programme');
        return { success: false };
      }

      console.log('✅ Programme mis à jour avec succès');
      
      // Attendre un peu pour s'assurer que Firestore a bien enregistré
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true, program: result.program };
    } catch (err: any) {
      console.error('Error updating program:', err);
      setError('Erreur lors de la mise à jour du programme');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getExistingProgram = useCallback(async () => {
    if (!user) {
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📖 Récupération programme existant pour userId:', user.uid);
      const program = await programGenerationService.getExistingProgram(user.uid);
      return program;
    } catch (err: any) {
      console.error('Error getting existing program:', err);
      setError('Erreur lors de la récupération du programme');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    checkExistingProgram,
    generateNewProgram,
    updateExistingProgram,
    getExistingProgram,
  };
}