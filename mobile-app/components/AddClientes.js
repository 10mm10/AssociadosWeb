import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Constants from 'expo-constants';
import tableStyles, { radioStyles } from '../assets/styles/tableStyles'; 
import { TextInputMask } from 'react-native-masked-text'; 
import { useLocalSearchParams } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 
import * as SecureStore from 'expo-secure-store';



const RadioButton = ({ label, selected, onSelect }) => (
    <TouchableOpacity 
        style={radioStyles.radioButtonContainer} 
        onPress={onSelect}
    >
        <View style={radioStyles.radioCircle}>
            {selected && <View style={radioStyles.selectedRb} />}
        </View>
        <Text style={radioStyles.radioText}>{label}</Text>
    </TouchableOpacity>
);

const AddClientes = ({ tipoCliente, onCancel, onClientAdded }) => {
    const { id_usuario } = useLocalSearchParams(); 

    const [nome, setNome] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [loading, setLoading] = useState(false);
    const [tipoAcesso, setTipoAcesso] = useState('publico'); 

    const handleSubmit = async () => {
    if (!id_usuario) {
        Alert.alert('Erro de Sessão', 'ID do usuário logado ausente.');
        return;
    }

    setLoading(true);

    try {
        // 2. Use o SecureStore com a chave exata que o seu ClientesTable usa
        const tokenRaw = await SecureStore.getItemAsync('AUTH_TOKEN'); 

        if (!tokenRaw) {
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        // Limpa as aspas se houver
        const token = tokenRaw.replace(/^["'](.+)["']$/, '$1');

        const backendUrl = Constants.expoConfig?.extra?.BACKEND_URL;

        const clienteData = {
            tipoCliente,
            tipo_acesso: tipoAcesso,
            email,
            celular,
            id_usuario,
            razao_social: tipoCliente === 'juridica' ? razaoSocial : null,
            nome: tipoCliente === 'fisica' ? nome : null,
            status: 'ativo'
        };

        const response = await fetch(`${backendUrl}/clientes`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(clienteData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Erro ao adicionar cliente');
        }

        Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
        onClientAdded();
        onCancel();
    } catch (error) {
        Alert.alert('Erro', error.message || 'Erro de conexão.');
    } finally {
        setLoading(false);
    }
};

    return (
        <View style={tableStyles.formContainer}>
            <Text style={tableStyles.formTitle}>
                Adicionar {tipoCliente === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
            </Text>

            <Text style={radioStyles.radioGroupTitle}>Tipo de Acesso:</Text>
            <View style={radioStyles.radioGroupContainer}>
                <RadioButton 
                    label="Público" 
                    selected={tipoAcesso === 'publico'}
                    onSelect={() => setTipoAcesso('publico')}
                />
                <RadioButton 
                    label="Privado" 
                    selected={tipoAcesso === 'privado'}
                    onSelect={() => setTipoAcesso('privado')}
                />
            </View>

            {tipoCliente === 'fisica' ? (
                <TextInput
                    style={tableStyles.input}
                    placeholder="Nome completo"
                    value={nome}
                    onChangeText={setNome}
                />
            ) : (
                <TextInput
                    style={tableStyles.input}
                    placeholder="Razão Social"
                    value={razaoSocial}
                    onChangeText={setRazaoSocial}
                />
            )}

            <TextInput
                style={tableStyles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            
            <TextInputMask
                style={tableStyles.input}
                placeholder="Celular"
                value={celular}
                onChangeText={setCelular}
                type={'cel-phone'}
                options={{
                    maskType: 'BRL',
                    withDDD: true,
                    dddMask: '(99) ',
                }}
                keyboardType="phone-pad"
            />

            <View style={tableStyles.formButtonContainer}>
                <TouchableOpacity style={[tableStyles.formButton, tableStyles.formCancelButton]} onPress={onCancel}>
                    <Text style={tableStyles.formButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={tableStyles.formButton} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator/> : <Text style={tableStyles.formButtonText}>Salvar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default AddClientes;
