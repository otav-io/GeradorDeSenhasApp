import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

interface SenhaHistorico {
  id: string;
  senha: string;
  data: string;
}

export default function HistoricoScreen() {
  const [historico, setHistorico] = React.useState<SenhaHistorico[]>([]);

  React.useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const historicoSalvo = await AsyncStorage.getItem('historicoSenhas');
      if (historicoSalvo) {
        setHistorico(JSON.parse(historicoSalvo));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const copiarSenha = async (senha: string) => {
    try {
      await navigator.clipboard.writeText(senha);
      alert('Senha copiada!');
    } catch (error) {
      console.error('Erro ao copiar senha:', error);
    }
  };

  const limparHistorico = async () => {
    try {
      await AsyncStorage.removeItem('historicoSenhas');
      setHistorico([]);
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  };

  const renderItem = ({ item }: { item: SenhaHistorico }) => (
    <View style={styles.itemContainer}>
      <View style={styles.senhaContainer}>
        <Text style={styles.senhaText}>{item.senha}</Text>
        <Text style={styles.dataText}>{item.data}</Text>
      </View>
      <TouchableOpacity
        style={styles.copiarButton}
        onPress={() => copiarSenha(item.senha)}
      >
        <Ionicons name="copy-outline" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico</Text>
        {historico.length > 0 && (
          <TouchableOpacity
            style={styles.limparButton}
            onPress={limparHistorico}
          >
            <Text style={styles.limparText}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {historico.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Nenhuma senha gerada ainda</Text>
        </View>
      ) : (
        <FlatList
          data={historico}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
  },
  limparButton: {
    padding: 8,
  },
  limparText: {
    color: '#666',
    fontSize: 15,
  },
  listContainer: {
    padding: 24,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  senhaContainer: {
    flex: 1,
  },
  senhaText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 4,
  },
  dataText: {
    color: '#666',
    fontSize: 12,
  },
  copiarButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  },
}); 