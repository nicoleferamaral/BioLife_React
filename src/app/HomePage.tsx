import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format, addDays, isToday, isTomorrow, differenceInCalendarDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  'Não reciclável',
  'Reciclável',
  'Óleo',
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
  'Cartela de medicamento',
  'Outra'
];

function getWeekDays() {
  const today = new Date();
  const days = [];
  for (let i = -2; i < 5; i++) {
    const date = addDays(today, i);
    days.push({
      label: format(date, 'EEE', { locale: ptBR }),
      day: date.getDate(),
      date,
    });
  }
  return days;
}

function getTitleForDate(date: Date) {
  const today = new Date();
  const diff = differenceInCalendarDays(date, today);

  if (diff === -2) return 'Anteontem';
  if (diff === -1) return 'Ontem';
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export default function HomePage() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(2);
  const weekDays = getWeekDays();
  const selectedDate = weekDays[selectedDayIdx].date;
  const title = getTitleForDate(selectedDate);

  const [search, setSearch] = useState('');
  const [items, setItems] = useState([
    { id: 1, type: 'Metal', weight: '2,5Kg' }
  ]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalWeight, setModalWeight] = useState('');
  const [categories, setCategories] = useState(CATEGORIES);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCategory, setOtherCategory] = useState('');

  // Funções de navegação e ações dos botões
  const handleEdit = (id: number) => { /* lógica de edição */ };
  const handleDelete = (id: number) => setItems(items.filter(item => item.id !== id));
  const handleCreate = () => setModalVisible(true);
  const handleHelp = () => { /* lógica de ajuda */ };
  const handleFilter = () => { /* lógica de filtro */ };
  const handleSearch = () => { /* lógica de busca */ };
  const handleTab = (tab: string) => { /* lógica de navegação */ };

  // Modal handlers
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setModalDate(selectedDate);
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
      setCategories([...categories.slice(0, -1), otherCategory, 'Outra']);
      setModalCategory(otherCategory);
      setShowOtherInput(false);
      setOtherCategory('');
    }
  };

  const handleSave = () => {
    if (!modalCategory || !modalWeight) return;
    setItems([
      ...items,
      {
        id: items.length + 1,
        type: modalCategory,
        weight: `${parseFloat(modalWeight).toFixed(2)}Kg`,
        date: modalDate
      }
    ]);
    setModalVisible(false);
    setModalDate(new Date());
    setModalCategory('');
    setModalWeight('');
    setShowOtherInput(false);
    setOtherCategory('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
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
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
          <Icon name="magnify" size={26} color="#222" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleFilter} style={styles.iconButton}>
          <Icon name="tune" size={26} color="#222" />
        </TouchableOpacity>
      </View>

      {/* Days of week */}
      <View style={styles.daysRow}>
        {weekDays.map((d, idx) => (
          <TouchableOpacity
            key={d.date.toISOString()}
            style={[
              styles.dayButton,
              idx === selectedDayIdx && styles.dayButtonSelected
            ]}
            onPress={() => setSelectedDayIdx(idx)}
          >
            <Text style={[
              styles.dayLabel,
              idx === selectedDayIdx && styles.dayLabelSelected
            ]}>{d.label}</Text>
            <Text style={[
              styles.dayNumber,
              idx === selectedDayIdx && styles.dayLabelSelected
            ]}>{d.day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Text style={styles.itemType}>{item.type}</Text>
            <Text style={styles.itemWeight}>{item.weight}</Text>
            <TouchableOpacity onPress={() => handleEdit(item.id)}>
              <Icon name="pencil" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Icon name="delete" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<View style={{ flex: 1 }} />}
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
            <Text style={styles.modalTitle}>Novo Registro</Text>
            
            {/* Data */}
            <Text style={styles.modalLabel}>Data</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
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
                maximumDate={new Date(2100, 12, 31)}
                minimumDate={new Date(2000, 0, 1)}
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
                // Permite apenas números e até 2 casas decimais
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

      {/* Bottom Menu */}
      <View style={styles.bottomMenu}>
        <TouchableOpacity onPress={() => handleTab('Home')}>
          <Icon name="home" size={28} color="#3b82f6" />
          <Text style={styles.menuLabelSelected}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Consultar')}>
          <Icon name="file-document-outline" size={28} color="#222" />
          <Text style={styles.menuLabel}>Consultar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Baixar')}>
          <Icon name="download" size={28} color="#222" />
          <Text style={styles.menuLabel}>Baixar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleTab('Ajustes')}>
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
  daysRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#c6efc6', paddingHorizontal: 8, paddingBottom: 8 },
  dayButton: { alignItems: 'center', padding: 4, borderRadius: 20, minWidth: 40 },
  dayButtonSelected: { backgroundColor: '#3b82f6' },
  dayLabel: { fontSize: 13, color: '#222' },
  dayLabelSelected: { color: '#fff', fontWeight: 'bold' },
  dayNumber: { fontSize: 16, color: '#222' },
  itemBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#222', margin: 16, padding: 16 },
  itemType: { fontSize: 18, flex: 1 },
  itemWeight: { fontSize: 18, flex: 1, textAlign: 'center' },
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
});