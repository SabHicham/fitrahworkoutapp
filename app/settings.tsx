import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setUserData } from '@/store/slices/userSlice';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Calendar, TrendingUp, Target, Bell, Shield, Save } from 'lucide-react-native';
import AppHeader from '@/components/AppHeader';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { name, age, height, weight } = useSelector((state: RootState) => state.user);
  
  const [formData, setFormData] = useState({
    name: name || '',
    age: age.toString(),
    height: height.toString(),
    weight: weight.toString(),
  });
  
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    nutritionTips: true,
    achievements: true,
    weeklyProgress: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSavePersonalData = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return;
    }

    const ageNum = parseInt(formData.age);
    const heightNum = parseInt(formData.height);
    const weightNum = parseInt(formData.weight);

    if (ageNum < 13 || ageNum > 100) {
      Alert.alert('Erreur', 'L\'âge doit être entre 13 et 100 ans');
      return;
    }

    if (heightNum < 100 || heightNum > 250) {
      Alert.alert('Erreur', 'La taille doit être entre 100 et 250 cm');
      return;
    }

    if (weightNum < 30 || weightNum > 300) {
      Alert.alert('Erreur', 'Le poids doit être entre 30 et 300 kg');
      return;
    }

    setIsLoading(true);
    
    try {
      dispatch(setUserData({
        name: formData.name.trim(),
        age: ageNum,
        height: heightNum,
        weight: weightNum,
        updatedAt: new Date().toISOString(),
      }));
      
      Alert.alert('Succès', 'Vos données personnelles ont été mises à jour');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setIsLoading(false);
    }
  };

  const personalDataSections = [
    {
      title: 'Informations personnelles',
      icon: User,
      fields: [
        {
          label: 'Nom complet',
          key: 'name',
          value: formData.name,
          placeholder: 'Votre nom',
          keyboardType: 'default' as const,
        },
        {
          label: 'Âge (années)',
          key: 'age',
          value: formData.age,
          placeholder: '25',
          keyboardType: 'numeric' as const,
        },
      ]
    },
    {
      title: 'Données physiques',
      icon: TrendingUp,
      fields: [
        {
          label: 'Taille (cm)',
          key: 'height',
          value: formData.height,
          placeholder: '170',
          keyboardType: 'numeric' as const,
        },
        {
          label: 'Poids (kg)',
          key: 'weight',
          value: formData.weight,
          placeholder: '70',
          keyboardType: 'numeric' as const,
        },
      ]
    }
  ];

  const notificationSections = [
    {
      title: 'Rappels d\'entraînement',
      description: 'Notifications pour vos séances programmées',
      key: 'workoutReminders' as keyof typeof notifications,
      icon: Target,
    },
    {
      title: 'Conseils nutrition',
      description: 'Tips quotidiens sur l\'alimentation',
      key: 'nutritionTips' as keyof typeof notifications,
      icon: Calendar,
    },
    {
      title: 'Achievements',
      description: 'Notifications pour vos badges débloqués',
      key: 'achievements' as keyof typeof notifications,
      icon: Target,
    },
    {
      title: 'Rapport hebdomadaire',
      description: 'Résumé de vos progrès chaque semaine',
      key: 'weeklyProgress' as keyof typeof notifications,
      icon: TrendingUp,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <AppHeader 
        title="Paramètres" 
        showBackButton={true}
      />

      <ScrollView style={styles.content}>
        {/* Données personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données personnelles</Text>
          
          {personalDataSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.dataSection}>
              <View style={styles.dataSectionHeader}>
                <section.icon size={20} color="#6EC1E4" />
                <Text style={styles.dataSectionTitle}>{section.title}</Text>
              </View>
              
              {section.fields.map((field, fieldIndex) => (
                <View key={fieldIndex} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.input}
                    value={field.value}
                    onChangeText={(text) => setFormData({ ...formData, [field.key]: text })}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType}
                    placeholderTextColor="#999999"
                  />
                </View>
              ))}
            </View>
          ))}
          
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSavePersonalData}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#CCCCCC', '#AAAAAA'] : ['#28A745', '#20C997']}
              style={styles.saveButtonGradient}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <View style={styles.notificationHeader}>
            <Bell size={24} color="#6EC1E4" />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          
          {notificationSections.map((notification, index) => (
            <View key={index} style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <notification.icon size={20} color="#333333" />
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDescription}>{notification.description}</Text>
                </View>
              </View>
              <Switch
                value={notifications[notification.key]}
                onValueChange={(value) => setNotifications({ ...notifications, [notification.key]: value })}
                trackColor={{ false: '#E9ECEF', true: '#6EC1E4' }}
                thumbColor={notifications[notification.key] ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          ))}
        </View>

        {/* Confidentialité */}
        <View style={styles.section}>
          <View style={styles.privacyHeader}>
            <Shield size={24} color="#6EC1E4" />
            <Text style={styles.sectionTitle}>Confidentialité</Text>
          </View>
          
          <View style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Protection des données</Text>
            <Text style={styles.privacyText}>
              Vos données personnelles sont chiffrées et stockées de manière sécurisée. 
              Nous ne partageons jamais vos informations avec des tiers sans votre consentement explicite.
            </Text>
            
            <TouchableOpacity style={styles.privacyButton}>
              <Text style={styles.privacyButtonText}>Voir la politique de confidentialité</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#333333',
    marginLeft: 12,
  },
  dataSection: {
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
  dataSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataSectionTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    flex: 1,
    marginLeft: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  privacyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyTitle: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
  },
  privacyButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#6EC1E4',
  },
  privacyButtonText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6EC1E4',
    textAlign: 'center',
  },
});