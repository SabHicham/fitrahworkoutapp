import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Upload, Video as VideoIcon, X, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { storageService } from '@/services/firebaseStorage';

interface VideoUploaderProps {
  onVideoUploaded: (videoUrl: string) => void;
  currentVideoUrl?: string;
  disabled?: boolean;
}

export default function VideoUploader({ onVideoUploaded, currentVideoUrl, disabled }: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(currentVideoUrl || null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à votre galerie pour sélectionner une vidéo.'
        );
        return false;
      }
    }
    return true;
  };

  const pickVideo = async () => {
    if (disabled || uploading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 secondes max
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedVideo(asset.uri);
        await uploadVideo(asset.uri, asset.fileName || 'video.mp4');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection de vidéo:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
    }
  };

  const uploadVideo = async (uri: string, fileName: string) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simuler le progrès d'upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uniqueFileName = storageService.generateVideoFileName(fileName);
      const result = await storageService.uploadVideo(uri, uniqueFileName);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.url) {
        onVideoUploaded(result.url);
        Alert.alert('Succès', 'Vidéo uploadée avec succès !');
      } else {
        throw new Error(result.error || 'Erreur d\'upload');
      }
    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      Alert.alert('Erreur', 'Impossible d\'uploader la vidéo');
      setSelectedVideo(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    onVideoUploaded('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vidéo de démonstration</Text>
      
      {selectedVideo ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: selectedVideo }}
            style={styles.videoPreview}
            useNativeControls
            resizeMode="contain"
            shouldPlay={false}
          />
          
          <View style={styles.videoActions}>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeVideo}
              disabled={disabled}
            >
              <X size={16} color="#DC3545" />
              <Text style={styles.removeButtonText}>Supprimer</Text>
            </TouchableOpacity>
            
            {uploading && (
              <View style={styles.uploadStatus}>
                <Check size={16} color="#28A745" />
                <Text style={styles.uploadStatusText}>Uploadée</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadButton, disabled && styles.uploadButtonDisabled]}
          onPress={pickVideo}
          disabled={disabled || uploading}
        >
          <LinearGradient
            colors={uploading ? ['#CCCCCC', '#AAAAAA'] : ['#6EC1E4', '#4A90E2']}
            style={styles.uploadButtonGradient}
          >
            {uploading ? (
              <>
                <Upload size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  Upload... {uploadProgress}%
                </Text>
              </>
            ) : (
              <>
                <VideoIcon size={24} color="#FFFFFF" />
                <Text style={styles.uploadButtonText}>
                  Sélectionner une vidéo
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      <Text style={styles.helpText}>
        Formats acceptés: MP4, MOV • Durée max: 60s • Taille max: 50MB
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  videoContainer: {
    marginBottom: 8,
  },
  videoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFE8E8',
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#DC3545',
    marginLeft: 4,
  },
  uploadStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
  },
  uploadStatusText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#28A745',
    marginLeft: 4,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
});