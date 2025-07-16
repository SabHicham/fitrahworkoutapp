import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Image } from 'react-native';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  colors?: string[];
}

export default function AppHeader({
  title,
  subtitle,
  showBackButton = false,
  rightComponent,
  colors = ['#6EC1E4', '#4A90E2']
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <LinearGradient
      colors={colors}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerOverlay} />
      <View style={styles.headerContent}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://i.imgur.com/m0ebU8Q.png' }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        {rightComponent ? (
          rightComponent
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 20,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 28,
    height: 28,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 19,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});