import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, Settings, LogOut, ChevronDown, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

export default function ProfileMenu() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { name } = useSelector((state: RootState) => state.user);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsMenuVisible(false);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCustomProgram = () => {
    setIsMenuVisible(false);
    router.push('/custom-program');
  };

  const handleSettings = () => {
    setIsMenuVisible(false);
    router.push('/settings');
  };

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Bouton du profil */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setIsMenuVisible(true)}
      >
        <Image
          source={{ uri: 'https://i.imgur.com/m0ebU8Q.png' }}
          style={styles.avatar}
          resizeMode="contain"
        />
        <ChevronDown size={16} color="#FFFFFF" style={styles.chevron} />
      </TouchableOpacity>

      {/* Menu déroulant */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menu}>
              {/* En-tête du menu avec info utilisateur */}
              <View style={styles.menuHeader}>
                <Image
                  source={{ uri: 'https://i.imgur.com/m0ebU8Q.png' }}
                  style={styles.menuAvatar}
                  resizeMode="contain"
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{name || 'Champion'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              {/* Séparateur */}
              <View style={styles.separator} />

              {/* Options du menu */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleCustomProgram}
              >
                <Target size={20} color="#6EC1E4" />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Mon programme sur mesure</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Modifier mes préférences d'entraînement
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSettings}
              >
                <Settings size={20} color="#333333" />
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>Paramètres</Text>
                  <Text style={styles.menuItemSubtitle}>
                    Données personnelles, notifications
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Séparateur */}
              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSignOut}
              >
                <LogOut size={20} color="#DC3545" />
                <View style={styles.menuItemContent}>
                  <Text style={[styles.menuItemTitle, styles.signOutText]}>
                    Se déconnecter
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    marginRight: 3,
  },
  chevron: {
    opacity: 0.8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
  },
  menuContainer: {
    marginTop: 8,
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuAvatar: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  separator: {
    height: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#666666',
  },
  signOutText: {
    color: '#DC3545',
  },
});