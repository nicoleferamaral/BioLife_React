import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useResiduos, type Residuos } from '../database/useResiduos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import { useNavigation } from "expo-router";

type CategoryStats = {
  category: string;
  totalWeight: number;
  count: number;
  lastDate: Date;
};

export default function Consultar() {
  const { consultar } = useResiduos();
  const [items, setItems] = useState<Residuos[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation()

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const result = await consultar();
      setItems(result);

      // Calculate statistics
      const stats = calculateCategoryStats(result);
      setCategoryStats(stats);

      // Calculate total weight
      const total = result.reduce((sum, item) => sum + item.peso, 0);
      setTotalWeight(total);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setIsLoading(false);
    }
  }

  function calculateCategoryStats(data: Residuos[]): CategoryStats[] {
    const statsMap = new Map<string, CategoryStats>();

    data.forEach(item => {
      const existing = statsMap.get(item.categoria);
      if (existing) {
        existing.totalWeight += item.peso;
        existing.count += 1;
        if (new Date(item.data) > existing.lastDate) {
          existing.lastDate = new Date(item.data);
        }
      } else {
        statsMap.set(item.categoria, {
          category: item.categoria,
          totalWeight: item.peso,
          count: 1,
          lastDate: new Date(item.data)
        });
      }
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalWeight - a.totalWeight);
  }

  async function generateExcelReport() {
    try {
      // Create CSV content
      let csvContent = 'Categoria,Peso Total (Kg),Quantidade,Última Data\n';
      categoryStats.forEach(stat => {
        csvContent += `${stat.category},${stat.totalWeight.toFixed(2)},${stat.count},${format(stat.lastDate, 'dd/MM/yyyy')}\n`;
      });
      csvContent += `\nTotal Geral,${totalWeight.toFixed(2)},${items.length},`;

      // Save file
      const fileName = `relatorio_residuos_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, csvContent);

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório');
    }
  }

  async function generatePDFReport() {
    try {
      // Create HTML content
      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .total { font-weight: bold; background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h1>Relatório de Resíduos</h1>
            <p>Data: ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            <table>
              <tr>
                <th>Categoria</th>
                <th>Peso Total (Kg)</th>
                <th>Quantidade</th>
                <th>Última Data</th>
              </tr>
              ${categoryStats.map(stat => `
                <tr>
                  <td>${stat.category}</td>
                  <td>${stat.totalWeight.toFixed(2)}</td>
                  <td>${stat.count}</td>
                  <td>${format(stat.lastDate, 'dd/MM/yyyy')}</td>
                </tr>
              `).join('')}
              <tr class="total">
                <td>Total Geral</td>
                <td>${totalWeight.toFixed(2)}</td>
                <td>${items.length}</td>
                <td></td>
              </tr>
            </table>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
    }
  }

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Relatório de Resíduos</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
          <Icon name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Icon name="scale" size={24} color="#3b82f6" />
          <Text style={styles.summaryValue}>{totalWeight.toFixed(2)} Kg</Text>
          <Text style={styles.summaryLabel}>Peso Total</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="counter" size={24} color="#3b82f6" />
          <Text style={styles.summaryValue}>{items.length}</Text>
          <Text style={styles.summaryLabel}>Registros</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="tag-multiple" size={24} color="#3b82f6" />
          <Text style={styles.summaryValue}>{categoryStats.length}</Text>
          <Text style={styles.summaryLabel}>Categorias</Text>
        </View>
      </View>

      {/* Report Buttons */}
      <View style={styles.reportButtons}>
        <TouchableOpacity style={styles.reportButton} onPress={generateExcelReport}>
          <Icon name="microsoft-excel" size={24} color="#fff" />
          <Text style={styles.reportButtonText}>Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportButton} onPress={generatePDFReport}>
          <Icon name="file-pdf-box" size={24} color="#fff" />
          <Text style={styles.reportButtonText}>PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Categories List */}
      <ScrollView style={styles.categoriesList} contentContainerStyle={styles.categoriesListContent}>
        {categoryStats.map((stat, index) => (
          <View key={index} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{stat.category}</Text>
              <Text style={styles.categoryWeight}>{stat.totalWeight.toFixed(2)} Kg</Text>
            </View>
            <View style={styles.categoryDetails}>
              <View style={styles.categoryDetail}>
                <Icon name="counter" size={16} color="#666" />
                <Text style={styles.categoryDetailText}>{stat.count} registros</Text>
              </View>
              <View style={styles.categoryDetail}>
                <Icon name="calendar" size={16} color="#666" />
                <Text style={styles.categoryDetailText}>
                  Último: {format(stat.lastDate, 'dd/MM/yyyy')}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => handleTab('Index')}>
          <Icon name="home" size={28} color="#222" />
          <Text style={styles.menuLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Consultar')}>
          <Icon name="file-document-outline" size={28} color="#3b82f6" />
          <Text style={styles.menuLabelSelected}>Consultar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Configurar')}>
          <Icon name="cog-outline" size={28} color="#222" />
          <Text style={styles.menuLabel}>Ajustes</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#c6efc6',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  refreshButton: {
    padding: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  reportButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoriesList: {
    flex: 1,
  },
  categoriesListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  categoryWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  categoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryDetailText: {
    fontSize: 14,
    color: '#666',
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
  menuLabel: {
    fontSize: 13,
    color: '#222',
    textAlign: 'center',
  },
  menuLabelSelected: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});