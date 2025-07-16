import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

export const storageService = {
  // Upload video to Firebase Storage
  async uploadVideo(uri: string, fileName: string): Promise<{ success: boolean; url?: string; error?: any }> {
    try {
      console.log('🎥 Début de l\'upload vidéo:', fileName);
      
      // Créer une référence dans le dossier videos
      const videoRef = ref(storage, `videos/${fileName}`);
      
      // Convertir l'URI en blob pour l'upload
      const response = await fetch(uri);
      const blob = await response.blob();
      
      console.log('📤 Upload du blob vers Firebase Storage...');
      
      // Upload du fichier
      const snapshot = await uploadBytes(videoRef, blob);
      
      console.log('✅ Upload terminé, récupération de l\'URL...');
      
      // Récupérer l'URL de téléchargement
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('🔗 URL générée:', downloadURL);
      
      return { success: true, url: downloadURL };
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload vidéo:', error);
      return { success: false, error };
    }
  },

  // Delete video from Firebase Storage
  async deleteVideo(videoUrl: string): Promise<{ success: boolean; error?: any }> {
    try {
      // Extraire le chemin du fichier depuis l'URL
      const videoRef = ref(storage, videoUrl);
      await deleteObject(videoRef);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression vidéo:', error);
      return { success: false, error };
    }
  },

  // Generate unique filename
  generateVideoFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop() || 'mp4';
    return `exercise_${timestamp}_${randomId}.${extension}`;
  }
};