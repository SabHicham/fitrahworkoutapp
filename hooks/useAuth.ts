import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { setUser, setLoading } from '@/store/slices/authSlice';
import { setUserData, setProfileLoading } from '@/store/slices/userSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { userService } from '@/services/firestore';
import { dateUtils } from '@/utils/dateUtils';
import { sanitizeUser } from '@/utils/sanitizeUser';
import { Platform } from 'react-native';
import { firebaseUtils } from '@/utils/firebaseUtils';

export function useAuth() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'Authenticated' : 'Not authenticated');
      
      try {
        if (firebaseUser) {
          console.log('👤 User authenticated:', firebaseUser.uid);
          console.log('📧 Email:', firebaseUser.email);
          console.log('👤 Display Name:', firebaseUser.displayName);
          
          // Sanitize user object before dispatching to prevent serialization errors on Expo Go
          const sanitizedUser = sanitizeUser(firebaseUser);
          dispatch(setUser(sanitizedUser));
          
          // Start profile loading
          dispatch(setProfileLoading(true));
          
          // Load user profile from Firestore with retry mechanism for Expo Go
          console.log('📖 Loading user profile from Firestore...');
          
          // Add delay for Expo Go to ensure Firestore is ready
          if (Platform.OS !== 'web') {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          try {
            // Use retry mechanism with cache clear for Expo Go
            const userProfileResult = await firebaseUtils.retryWithCacheClear(
              async () => await userService.getUserProfile(firebaseUser.uid),
              2
            );
            
            if (userProfileResult.success && userProfileResult.data) {
              const userData = userProfileResult.data;
              console.log('✅ User profile found in Firestore');
              console.log('📊 Loaded user data:', {
                level: userData.level,
                goal: userData.goal,
                diet: userData.diet,
                selectedDays: userData.selectedDays,
                daysPerWeek: userData.daysPerWeek,
                isOnboarded: userData.isOnboarded
              });
              
              // Ensure all required fields are present with defaults
              const completeUserData = {
                ...userData,
                name: userData.name || firebaseUser.displayName || '',
                email: userData.email || firebaseUser.email || '',
                isOnboarded: Boolean(userData.isOnboarded),
                level: userData.level || 'Débutant',
                goal: userData.goal || 'Perdre du poids',
                diet: userData.diet || 'Standard',
                selectedDays: userData.selectedDays || ['monday', 'wednesday', 'friday'],
                daysPerWeek: userData.daysPerWeek || userData.selectedDays?.length || 3,
                age: userData.age || 25,
                height: userData.height || 170,
                weight: userData.weight || 70,
                badges: userData.badges || [],
                achievements: userData.achievements || [
                  {
                    id: '1',
                    name: 'Badge Argent',
                    description: '20 tractions',
                    type: 'Argent',
                    progress: 14,
                    target: 20,
                    unlocked: false,
                  },
                  {
                    id: '2',
                    name: 'Badge Or',
                    description: '10 muscle-ups',
                    type: 'Or',
                    progress: 3,
                    target: 10,
                    unlocked: false,
                  },
                  {
                    id: '3',
                    name: 'Badge Diamant',
                    description: 'Combo complet',
                    type: 'Diamant',
                    progress: 0,
                    target: 1,
                    unlocked: false,
                  },
                ],
                disciplineScore: userData.disciplineScore || 85,
              };
              
              // Serialize dates for Redux
              const serializedUserData = dateUtils.serializeObjectDates(completeUserData);
              dispatch(setUserData(serializedUserData));
              console.log('✅ User state updated from Firestore with complete preferences');
            } else {
              console.log('⚠️ No user profile found or failed to load - treating as new user');
              
              // New user - set default data
              dispatch(setUserData({
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                isOnboarded: false,
                level: 'Débutant',
                goal: 'Perdre du poids',
                diet: 'Standard',
                selectedDays: ['monday', 'wednesday', 'friday'],
                daysPerWeek: 3,
                age: 25,
                height: 170,
                weight: 70,
                badges: [],
                achievements: [
                  {
                    id: '1',
                    name: 'Badge Argent',
                    description: '20 tractions',
                    type: 'Argent',
                    progress: 14,
                    target: 20,
                    unlocked: false,
                  },
                  {
                    id: '2',
                    name: 'Badge Or',
                    description: '10 muscle-ups',
                    type: 'Or',
                    progress: 3,
                    target: 10,
                    unlocked: false,
                  },
                  {
                    id: '3',
                    name: 'Badge Diamant',
                    description: 'Combo complet',
                    type: 'Diamant',
                    progress: 0,
                    target: 1,
                    unlocked: false,
                  },
                ],
                disciplineScore: 85,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }));
            }
          } catch (firestoreError: any) {
            console.error('❌ Firestore error during auth:', firestoreError);
            
            // Handle specific Firebase errors
            if (firestoreError.code === 'unavailable') {
              console.log('🔄 Firestore temporarily unavailable, using default data');
            }
            
            // Continue with default data on Firestore errors
            dispatch(setUserData({
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              isOnboarded: false,
              level: 'Débutant',
              goal: 'Perdre du poids',
              diet: 'Standard',
              selectedDays: ['monday', 'wednesday', 'friday'],
              daysPerWeek: 3,
              age: 25,
              height: 170,
              weight: 70,
              badges: [],
              achievements: [
                {
                  id: '1',
                  name: 'Badge Argent',
                  description: '20 tractions',
                  type: 'Argent',
                  progress: 14,
                  target: 20,
                  unlocked: false,
                },
                {
                  id: '2',
                  name: 'Badge Or',
                  description: '10 muscle-ups',
                  type: 'Or',
                  progress: 3,
                  target: 10,
                  unlocked: false,
                },
                {
                  id: '3',
                  name: 'Badge Diamant',
                  description: 'Combo complet',
                  type: 'Diamant',
                  progress: 0,
                  target: 1,
                  unlocked: false,
                },
              ],
              disciplineScore: 85,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
          } finally {
            // Always stop profile loading regardless of success or failure
            dispatch(setProfileLoading(false));
          }
        } else {
          console.log('🚪 User signed out - resetting state');
          
          // Stop profile loading for signed out user
          dispatch(setProfileLoading(false));
          
          // User signed out - dispatch null (already serializable)
          dispatch(setUser(null));
          dispatch(setUserData({
            isOnboarded: false,
            name: '',
            level: 'Débutant',
            goal: 'Perdre du poids',
            diet: 'Standard',
            selectedDays: ['monday', 'wednesday', 'friday'],
            daysPerWeek: 3,
            age: 25,
            height: 170,
            weight: 70,
            badges: [],
            achievements: [
              {
                id: '1',
                name: 'Badge Argent',
                description: '20 tractions',
                type: 'Argent',
                progress: 14,
                target: 20,
                unlocked: false,
              },
              {
                id: '2',
                name: 'Badge Or',
                description: '10 muscle-ups',
                type: 'Or',
                progress: 3,
                target: 10,
                unlocked: false,
              },
              {
                id: '3',
                name: 'Badge Diamant',
                description: 'Combo complet',
                type: 'Diamant',
                progress: 0,
                target: 1,
                unlocked: false,
              },
            ],
            disciplineScore: 85,
          }));
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        // Stop profile loading on error
        dispatch(setProfileLoading(false));
        // Set sanitized user anyway to prevent infinite loading
        const sanitizedUser = sanitizeUser(firebaseUser);
        dispatch(setUser(sanitizedUser));
      } finally {
        dispatch(setLoading(false));
      }
    });

    return () => {
      console.log('🔐 Cleaning up auth state listener');
      unsubscribe();
    };
  }, [dispatch]);
}