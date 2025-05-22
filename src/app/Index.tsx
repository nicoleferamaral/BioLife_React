import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Platform, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useResiduos, type Residuos } from '../database/useResiduos';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  'Outra',
  'Não reciclável',
  'Reciclável',
  'Oleo',
  'Tampinhas plásticas',
  'Lacres de alumínio',
  'Tecidos',
  'Meias',
  'Material de escrita',
  'Esponjas',
  'Eletrônicos',
  'Pilhas e baterias',
  'Infectante',
  'Químicos',
  'Lâmpada fluorescente',
  'Tonners de impressora',
  'Esmaltes',
  'Cosméticos',
  'Cartela de medicamento'
];

const router = useRouter();

export default function Index() {
  const { create, consultar, remove, atualizar } = useResiduos();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<Residuos[]>([]);
  const [filteredItems, setFilteredItems] = useState<Residuos[]>([]);
  const [editingItem, setEditingItem] = useState<Residuos | null>(null);

  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [filterMinWeight, setFilterMinWeight] = useState('');
  const [filterMaxWeight, setFilterMaxWeight] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalWeight, setModalWeight] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');

  // Load items and categories
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      const result = await consultar();
      setItems(result);
      setFilteredItems(result);
      
      // Extract unique categories and sort them
      const categories = Array.from(new Set([
        ...CATEGORIES,
        ...result.map(item => item.categoria)
      ])).sort();
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os registros');
    }
  }

  // Filter functions
  const applyFilters = (data: Residuos[]) => {
    let filtered = [...data];

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data);
        return itemDate >= filterStartDate;
      });
    }
    if (filterEndDate) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.data);
        return itemDate <= filterEndDate;
      });
    }

    // Filter by weight range
    if (filterMinWeight) {
      const minWeight = parseFloat(filterMinWeight);
      filtered = filtered.filter(item => item.peso >= minWeight);
    }
    if (filterMaxWeight) {
      const maxWeight = parseFloat(filterMaxWeight);
      filtered = filtered.filter(item => item.peso <= maxWeight);
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(item => 
        item.categoria.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    setFilteredItems(filtered);
  };

  const handleFilter = () => {
    setFilterModalVisible(true);
  };

  const handleClearFilters = () => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterMinWeight('');
    setFilterMaxWeight('');
    setFilterCategory('');
    setFilteredItems(items);
  };

  const handleApplyFilters = () => {
    applyFilters(items);
    setFilterModalVisible(false);
  };

  // Funções de navegação e ações dos botões
  const handleEdit = (item: Residuos) => {
    setEditingItem(item);
    setModalDate(new Date(item.data));
    setModalCategory(item.categoria);
    setModalWeight(item.peso.toString());
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(id);
              await loadItems();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o registro');
            }
          }
        }
      ]
    );
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalDate(new Date());
    setModalCategory('');
    setModalWeight('');
    setModalVisible(true);
  };

  const handleHelp = () => {
    Alert.alert('Ajuda', 'Toque no botão + para adicionar um novo registro.\nToque no lápis para editar.\nToque no lixeira para excluir.');
  };

  const handleSearch = () => {
    const searchTerm = search.toLowerCase();
    const filtered = items.filter(item => 
      item.categoria.toLowerCase().includes(searchTerm)
    );
    setFilteredItems(filtered);
  };

  const handleTab = (screen: string) => {
    switch (screen) {
      case 'Index':
        router.push('/');
        break;
      case 'Consultar':
        router.push('/Consultar');
        break;
      case 'Baixar':
        router.push('/Baixar');
        break;
      case 'Configurar':
        router.push('/Configurar');
        break;
    }
  };

  // Modal handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      // Ajusta a data para o início do dia no fuso horário local
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(0, 0, 0, 0);
      setModalDate(adjustedDate);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setFilterStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setFilterEndDate(selectedDate);
    }
  };

  const handleCategorySelect = (cat: string) => {
    if (cat === 'Outra') {
      setShowOtherInput(true);
      setModalCategory('');
    } else {
      setModalCategory(cat);
      setShowOtherInput(false);
    }
  };

  const handleAddOtherCategory = () => {
    if (otherCategory.trim()) {
      // Remove 'Outra' from the end if it exists
      const categoriesWithoutOther = categories.filter(cat => cat !== 'Outra');
      // Add the new category and 'Outra' back
      setCategories([...categoriesWithoutOther, otherCategory, 'Outra']);
      setModalCategory(otherCategory);
      setShowOtherInput(false);
      setOtherCategory('');
    }
  };

  const handleSave = async () => {
    if (!modalCategory || !modalWeight) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      // Ajusta a data para o início do dia no fuso horário local
      const adjustedDate = new Date(modalDate);
      adjustedDate.setHours(0, 0, 0, 0);

      const data = {
        data: adjustedDate,
        categoria: modalCategory,
        peso: parseFloat(modalWeight)
      };

      if (editingItem) {
        await atualizar({
          id: editingItem.id,
          ...data
        });
      } else {
        await create(data);
      }

      await loadItems();
      setModalVisible(false);
      setModalDate(new Date());
      setModalCategory('');
      setModalWeight('');
      setShowOtherInput(false);
      setOtherCategory('');
      setEditingItem(null);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível salvar o registro');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Registros</Text>
        <TouchableOpacity onPress={handleHelp} style={styles.iconButton}>
          <Icon name="help-circle-outline" size={28} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Search and filter */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
          <Icon name="magnify" size={26} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilter} style={styles.iconButton}>
          <Icon name="tune" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <View style={styles.itemContent}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemDate}>
                  {format(new Date(item.data), "dd/MM/yyyy", { locale: ptBR })}
                </Text>
                <Text style={styles.itemType}>{item.categoria}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemWeight}>{item.peso}Kg</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                    <Icon name="pencil" size={20} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                    <Icon name="delete" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
          </View>
        }
      />

      {/* Criar+ Button */}
      <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
        <Text style={styles.createButtonText}>Criar+</Text>
      </TouchableOpacity>

      {/* Modal de criação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Editar Registro' : 'Novo Registro'}
            </Text>
            
            {/* Data */}
            <Text style={styles.modalLabel}>Data</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>
                {format(modalDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Text>
              <Icon name="calendar" size={22} color="#3b82f6" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={modalDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                locale="pt-BR"
              />
            )}

            {/* Categoria */}
            <Text style={styles.modalLabel}>Categoria</Text>
            <View style={styles.categoriesContainer}>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      modalCategory === item && styles.categoryButtonSelected
                    ]}
                    onPress={() => handleCategorySelect(item)}
                  >
                    <Text style={[
                      styles.categoryText,
                      modalCategory === item && styles.categoryTextSelected
                    ]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            {showOtherInput && (
              <View style={styles.otherInputRow}>
                <TextInput
                  style={styles.otherInput}
                  placeholder="Digite a categoria"
                  value={otherCategory}
                  onChangeText={setOtherCategory}
                />
                <TouchableOpacity style={styles.addOtherButton} onPress={handleAddOtherCategory}>
                  <Icon name="plus" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Peso */}
            <Text style={styles.modalLabel}>Peso (Kg)</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Ex: 1.25"
              value={modalWeight}
              onChangeText={text => {
                const formatted = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                const match = formatted.match(/^\d*\.?\d{0,2}/);
                setModalWeight(match ? match[0] : '');
              }}
              keyboardType="numeric"
              maxLength={6}
            />

            {/* Botões */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!modalCategory || !modalWeight) && { backgroundColor: '#bcdffb' }
                ]}
                onPress={handleSave}
                disabled={!modalCategory || !modalWeight}
              >
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>

            {/* Date Range */}
            <Text style={styles.modalLabel}>Data Inicial</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowStartDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>
                {filterStartDate ? format(filterStartDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione'}
              </Text>
              <Icon name="calendar" size={22} color="#3b82f6" />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={filterStartDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
                locale="pt-BR"
              />
            )}

            <Text style={styles.modalLabel}>Data Final</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowEndDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>
                {filterEndDate ? format(filterEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione'}
              </Text>
              <Icon name="calendar" size={22} color="#3b82f6" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={filterEndDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                locale="pt-BR"
              />
            )}

            {/* Weight Range */}
            <Text style={styles.modalLabel}>Peso Mínimo (Kg)</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Ex: 1.25"
              value={filterMinWeight}
              onChangeText={text => {
                const formatted = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                const match = formatted.match(/^\d*\.?\d{0,2}/);
                setFilterMinWeight(match ? match[0] : '');
              }}
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.modalLabel}>Peso Máximo (Kg)</Text>
            <TextInput
              style={styles.weightInput}
              placeholder="Ex: 5.75"
              value={filterMaxWeight}
              onChangeText={text => {
                const formatted = text.replace(/[^0-9.,]/g, '').replace(',', '.');
                const match = formatted.match(/^\d*\.?\d{0,2}/);
                setFilterMaxWeight(match ? match[0] : '');
              }}
              keyboardType="numeric"
              maxLength={6}
            />

            {/* Category */}
            <Text style={styles.modalLabel}>Categoria</Text>
            <View style={styles.categoriesContainer}>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      filterCategory === item && styles.categoryButtonSelected
                    ]}
                    onPress={() => setFilterCategory(item)}
                  >
                    <Text style={[
                      styles.categoryText,
                      filterCategory === item && styles.categoryTextSelected
                    ]}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Filter Buttons */}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClearFilters}>
                <Text style={styles.cancelButtonText}>Limpar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleApplyFilters}>
                <Text style={styles.saveButtonText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => handleTab('Index')}>
          <Icon name="home" size={28} color="#3b82f6" />
          <Text style={styles.menuLabelSelected}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Consultar')}>
          <Icon name="file-document-outline" size={28} color="#222" />
          <Text style={styles.menuLabel}>Consultar</Text>
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
  container: { flex: 1, backgroundColor: '#fdf6e3' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#c6efc6', paddingTop: 40, paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222' },
  iconButton: { marginLeft: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#c6efc6', paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, height: 36, marginRight: 8, fontSize: 16 },
  itemBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    elevation: 1,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  itemWeight: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    marginRight: 12,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
  },
  createButton: { position: 'absolute', right: 24, bottom: 80, backgroundColor: '#3b82f6', borderRadius: 32, paddingVertical: 14, paddingHorizontal: 24, elevation: 2 },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  bottomMenu: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#c6efc6', paddingVertical: 8, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  menuLabel: { fontSize: 13, color: '#222', textAlign: 'center' },
  menuLabelSelected: { fontSize: 13, color: '#3b82f6', fontWeight: 'bold', textAlign: 'center' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#3b82f6', marginBottom: 12, textAlign: 'center' },
  modalLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 10, marginBottom: 4, color: '#222' },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f0f0', borderRadius: 12, padding: 10, marginBottom: 4 },
  categoriesContainer: { flexDirection: 'row', marginVertical: 6 },
  categoryButton: { backgroundColor: '#e0e7ef', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 14, marginRight: 8 },
  categoryButtonSelected: { backgroundColor: '#3b82f6' },
  categoryText: { color: '#222', fontSize: 14 },
  categoryTextSelected: { color: '#fff', fontWeight: 'bold' },
  otherInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  otherInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 12, padding: 10, fontSize: 15 },
  addOtherButton: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 8, marginLeft: 8 },
  weightInput: { backgroundColor: '#f0f0f0', borderRadius: 12, padding: 10, fontSize: 15, marginTop: 4, marginBottom: 10 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#eee', marginRight: 10 },
  cancelButtonText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  saveButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#3b82f6' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
  },
  selectButtonText: {
    fontSize: 16,
    color: '#222',
  },
});