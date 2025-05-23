import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

export default function Configurar() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, fontSize, setFontSize } = useTheme();
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      const savedHighContrast = await AsyncStorage.getItem('highContrast');
      const savedScreenReader = await AsyncStorage.getItem('screenReader');

      if (savedFontSize) setFontSize(Number(savedFontSize));
      if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
      if (savedScreenReader) setScreenReader(savedScreenReader === 'true');
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  const savePreference = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    savePreference('fontSize', newSize.toString());
  };

  const handleHighContrastChange = (value: boolean) => {
    setHighContrast(value);
    savePreference('highContrast', value.toString());
  };

  const handleScreenReaderChange = (value: boolean) => {
    setScreenReader(value);
    savePreference('screenReader', value.toString());
  };

  const handleTab = (screen: string) => {
    switch (screen) {
      case 'Index':
        router.push('/Index');
        break;
      case 'Consultar':
        router.push('/Consultar');
        break;
      case 'Configurar':
        router.push('/Configurar');
        break;
    }
  };

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <View style={styles.headerTitleContainer}>
            <Image 
              source={require('../../assets/images/logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          <Text style={[styles.title, isDarkMode && styles.titleDark]}>Configurações</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Theme Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Tema</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingText, isDarkMode && styles.textDark]}>Modo Escuro</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkMode ? '#3b82f6' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Font Size Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Tamanho da Fonte</Text>
          <View style={styles.fontSizeControls}>
            <TouchableOpacity 
              style={[styles.fontSizeButton, isDarkMode && styles.buttonDark]} 
              onPress={() => handleFontSizeChange(Math.max(12, fontSize - 1))}
            >
              <Icon name="minus" size={24} color={isDarkMode ? '#fff' : '#222'} />
            </TouchableOpacity>
            <Text style={[styles.fontSizeValue, isDarkMode && styles.textDark]}>{fontSize}</Text>
            <TouchableOpacity 
              style={[styles.fontSizeButton, isDarkMode && styles.buttonDark]} 
              onPress={() => handleFontSizeChange(Math.min(24, fontSize + 1))}
            >
              <Icon name="plus" size={24} color={isDarkMode ? '#fff' : '#222'} />
            </TouchableOpacity>
          </View>
        </View>

       

        {/* Credits Section */}
        <View style={[styles.section, isDarkMode && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Créditos</Text>
          <Text style={[styles.creditsText, isDarkMode && styles.textDark]}>
            Desenvolvido por:{'\n'}
            Nicole Ferreira do Amaral{'\n'}
            Carolina Santos de Carvalho
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Menu */}
      <View style={[styles.bottomMenu, isDarkMode && styles.bottomMenuDark]}>
        <TouchableOpacity onPress={() => handleTab('Index')}>
          <Icon name="home" size={28} color={isDarkMode ? '#fff' : '#222'} />
          <Text style={[styles.menuLabel, isDarkMode && styles.menuLabelDark]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Consultar')}>
          <Icon name="file-document-outline" size={28} color={isDarkMode ? '#fff' : '#222'} />
          <Text style={[styles.menuLabel, isDarkMode && styles.menuLabelDark]}>Consultar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Configurar')}>
          <Icon name="cog-outline" size={28} color={isDarkMode ? '#3b82f6' : '#3b82f6'} />
          <Text style={[styles.menuLabelSelected, isDarkMode && styles.menuLabelSelectedDark]}>Ajustes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf6e3',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
  },
  headerTitleContainer: {
     flexDirection: 'row', 
     alignItems: 'center' 
    },
  headerLogo: { 
    width: 45, 
    height: 45, 
    marginRight: 8 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#c6efc6',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerDark: {
    backgroundColor: '#2d2d2d',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  titleDark: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionDark: {
    backgroundColor: '#2d2d2d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  textDark: {
    color: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#222',
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  fontSizeButton: {
    backgroundColor: '#e0e7ef',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 12,
  },
  buttonDark: {
    backgroundColor: '#404040',
  },
  fontSizeValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  creditsText: {
    fontSize: 16,
    color: '#222',
    lineHeight: 24,
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#c6efc6',
    paddingVertical: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomMenuDark: {
    backgroundColor: '#2d2d2d',
  },
  menuLabel: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
  },
  menuLabelDark: {
    color: '#fff',
  },
  menuLabelSelected: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  menuLabelSelectedDark: {
    color: '#3b82f6',
  },
});
