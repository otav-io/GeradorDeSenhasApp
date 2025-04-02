import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Switch, Animated, FlatList, Dimensions, Clipboard } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SenhaHistorico {
  id: string;
  senha: string;
  data: string;
}

export default function App() {
  const [senha, setSenha] = useState('');
  const [tamanho, setTamanho] = useState('12');
  const [maiusculas, setMaiusculas] = useState(true);
  const [minusculas, setMinusculas] = useState(true);
  const [numeros, setNumeros] = useState(true);
  const [simbolos, setSimbolos] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [historico, setHistorico] = useState<SenhaHistorico[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<'gerador' | 'historico'>('gerador');

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    carregarHistorico();
  }, []);

  const animarBotao = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

  const salvarSenha = async (novaSenha: string) => {
    try {
      const novaSenhaHistorico: SenhaHistorico = {
        id: Date.now().toString(),
        senha: novaSenha,
        data: new Date().toLocaleString('pt-BR'),
      };
      const novoHistorico = [novaSenhaHistorico, ...historico];
      await AsyncStorage.setItem('historicoSenhas', JSON.stringify(novoHistorico));
      setHistorico(novoHistorico);
    } catch (error) {
      console.error('Erro ao salvar senha:', error);
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

  const gerarSenha = () => {
    animarBotao();
    const maiusculasChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minusculasChars = 'abcdefghijklmnopqrstuvwxyz';
    const numerosChars = '0123456789';
    const simbolosChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = '';
    if (maiusculas) chars += maiusculasChars;
    if (minusculas) chars += minusculasChars;
    if (numeros) chars += numerosChars;
    if (simbolos) chars += simbolosChars;

    if (chars === '') {
      alert('Selecione pelo menos uma opção!');
      return;
    }

    let novaSenha = '';
    for (let i = 0; i < parseInt(tamanho); i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      novaSenha += chars[randomIndex];
    }

    setSenha(novaSenha);
    salvarSenha(novaSenha);
  };

  const copiarSenha = async (texto: string) => {
    try {
      await Clipboard.setString(texto);
      alert('Senha copiada!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const renderItem = ({ item }: { item: SenhaHistorico }) => (
    <View style={styles.historicoItem}>
      <View style={styles.historicoItemContent}>
        <Text style={styles.historicoSenha}>{item.senha}</Text>
        <Text style={styles.historicoData}>{item.data}</Text>
      </View>
      <TouchableOpacity
        style={styles.copiarHistoricoButton}
        onPress={() => copiarSenha(item.senha)}
      >
        <Text style={styles.copiarHistoricoText}>Copiar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGerador = () => (
    <View style={styles.geradorContainer}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Gerador de Senhas</Text>
        <Text style={styles.subtitulo}>Crie senhas seguras em segundos</Text>
      </View>
      
      <View style={styles.senhaContainer}>
        <TextInput
          style={styles.senhaInput}
          value={senha}
          editable={false}
          placeholder="Sua senha aparecerá aqui"
          placeholderTextColor="#666"
        />
        <TouchableOpacity
          style={styles.copiarButton}
          onPress={() => {
            if (senha) {
              copiarSenha(senha);
            }
          }}
        >
          <Text style={styles.copiarText}>Copiar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.opcoesContainer}>
        <View style={styles.opcaoRow}>
          <Text style={styles.opcaoText}>Tamanho da senha</Text>
          <View style={styles.tamanhoContainer}>
            <TouchableOpacity
              style={styles.tamanhoButton}
              onPress={() => setTamanho(prev => Math.max(8, parseInt(prev) - 1).toString())}
            >
              <Text style={styles.tamanhoButtonText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.tamanhoInput}
              value={tamanho}
              onChangeText={setTamanho}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.tamanhoButton}
              onPress={() => setTamanho(prev => Math.min(32, parseInt(prev) + 1).toString())}
            >
              <Text style={styles.tamanhoButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Maiúsculas</Text>
            <Switch 
              value={maiusculas} 
              onValueChange={setMaiusculas}
              trackColor={{ false: '#333', true: '#ffffff' }}
              thumbColor={maiusculas ? '#000000' : '#f4f4f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Minúsculas</Text>
            <Switch 
              value={minusculas} 
              onValueChange={setMinusculas}
              trackColor={{ false: '#333', true: '#ffffff' }}
              thumbColor={minusculas ? '#000000' : '#f4f4f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Números</Text>
            <Switch 
              value={numeros} 
              onValueChange={setNumeros}
              trackColor={{ false: '#333', true: '#ffffff' }}
              thumbColor={numeros ? '#000000' : '#f4f4f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Símbolos</Text>
            <Switch 
              value={simbolos} 
              onValueChange={setSimbolos}
              trackColor={{ false: '#333', true: '#ffffff' }}
              thumbColor={simbolos ? '#000000' : '#f4f4f4'}
            />
          </View>
        </View>
      </View>

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity 
          style={styles.gerarButton} 
          onPress={gerarSenha}
          activeOpacity={0.8}
        >
          <Text style={styles.gerarText}>Gerar Senha</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  const renderHistorico = () => (
    <View style={styles.historicoContainer}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico</Text>
        <Text style={styles.subtitulo}>Suas senhas geradas</Text>
      </View>

      {historico.length > 0 ? (
        <FlatList
          data={historico}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.historicoList}
          contentContainerStyle={styles.historicoListContent}
        />
      ) : (
        <View style={styles.historicoVazio}>
          <Text style={styles.historicoVazioText}>Nenhuma senha gerada ainda</Text>
        </View>
      )}

      {historico.length > 0 && (
        <TouchableOpacity 
          style={[styles.gerarButton, styles.limparButton]} 
          onPress={limparHistorico}
          activeOpacity={0.8}
        >
          <Text style={styles.gerarText}>Limpar Histórico</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar style="light" />
      
      {abaAtiva === 'gerador' ? renderGerador() : renderHistorico()}

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.footerTab, abaAtiva === 'gerador' && styles.footerTabAtiva]}
          onPress={() => setAbaAtiva('gerador')}
        >
          <Text style={[styles.footerTabText, abaAtiva === 'gerador' && styles.footerTabTextAtiva]}>Gerador</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.footerTab, abaAtiva === 'historico' && styles.footerTabAtiva]}
          onPress={() => setAbaAtiva('historico')}
        >
          <Text style={[styles.footerTabText, abaAtiva === 'historico' && styles.footerTabTextAtiva]}>Histórico</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    paddingTop: 40,
    paddingBottom: 70,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#282828',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  footerTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerTabAtiva: {
    borderTopWidth: 2,
    borderTopColor: '#ffffff',
  },
  footerTabText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '600',
  },
  footerTabTextAtiva: {
    color: '#ffffff',
  },
  geradorContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitulo: {
    fontSize: 14,
    color: '#b3b3b3',
    fontWeight: '400',
  },
  senhaContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  senhaInput: {
    flex: 1,
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 20,
    fontSize: 16,
    color: '#ffffff',
    letterSpacing: 1,
  },
  copiarButton: {
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
    minWidth: 80,
  },
  copiarText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  opcoesContainer: {
    backgroundColor: '#282828',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  opcaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  opcaoText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  tamanhoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tamanhoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#404040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tamanhoButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tamanhoInput: {
    width: 50,
    textAlign: 'center',
    backgroundColor: '#404040',
    borderRadius: 16,
    padding: 6,
    color: '#ffffff',
    fontSize: 14,
  },
  switchContainer: {
    marginTop: 16,
    gap: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '400',
  },
  gerarButton: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  limparButton: {
    backgroundColor: '#ff4444',
    shadowColor: '#ff4444',
  },
  gerarText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historicoList: {
    flex: 1,
  },
  historicoListContent: {
    paddingBottom: 16,
  },
  historicoItem: {
    backgroundColor: '#282828',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historicoItemContent: {
    flex: 1,
  },
  historicoSenha: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 2,
    letterSpacing: 1,
  },
  historicoData: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  copiarHistoricoButton: {
    backgroundColor: '#404040',
    padding: 8,
    borderRadius: 16,
    marginLeft: 8,
  },
  copiarHistoricoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  historicoVazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  historicoVazioText: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
  },
  historicoContainer: {
    flex: 1,
  },
}); 