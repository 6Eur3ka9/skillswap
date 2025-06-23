import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useUser } from '@/service/context.provider';
import { UserService } from '@/service/user.service';

export default function Register() {
  const router = useRouter();
  const { setConnectedUserId, setConnectedUserAccessToken, setConnectedUserRefreshToken } = useUser();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<{[key:string]:string}>({});
  const [loading, setLoading] = useState(false);

  const onChangeDate = (_event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setBirthDate(selectedDate);
  };

  const validate = () => {
    const errs: {[key:string]:string} = {};
    if (!name.trim()) errs.name = 'Nom requis';
    if (!username.trim()) errs.username = 'Utilisateur requis';
    if (!city.trim()) errs.city = 'Ville requise';
    if (!phone.trim()) errs.phone = 'Téléphone requis';
    if (!email.trim()) errs.email = 'Email requis';
    if (!password) errs.password = 'Mot de passe requis';
    if (password !== confirmPassword) errs.confirm = 'Les mots de passe ne correspondent pas';
    return errs;
  };

  const handleRegister = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const data = { name, username, email, password, phone, city, dateOfBirth: birthDate };
      const response = await UserService.register(data);
      const { userId, accessToken, refreshToken } = response.data;
      await setConnectedUserId(userId);
      await setConnectedUserAccessToken(accessToken);
      await setConnectedUserRefreshToken(refreshToken);
      router.replace('/private/ProfilePictureUpload');
    } catch (error) {
      const msg = error.response?.data?.msg || 'Échec de l\'inscription';
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Inscription</Text>
      <Label text="Nom complet" error={errors.name} />
      <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} />

      <Label text="Nom d'utilisateur" error={errors.username} />
      <TextInput style={[styles.input, errors.username && styles.inputError]} value={username} onChangeText={setUsername} />

      <Label text="Ville" error={errors.city} />
      <TextInput style={[styles.input, errors.city && styles.inputError]} value={city} onChangeText={setCity} />

      <Label text="Téléphone" error={errors.phone} />
      <TextInput style={[styles.input, errors.phone && styles.inputError]} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Label text="Email" error={errors.email} />
      <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Label text="Mot de passe" error={errors.password} />
      <TextInput style={[styles.input, errors.password && styles.inputError]} value={password} onChangeText={setPassword} secureTextEntry />

      <Label text="Confirmer le mot de passe" error={errors.confirm} />
      <TextInput style={[styles.input, errors.confirm && styles.inputError]} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

      <Label text="Date de naissance" error={undefined} />
      <TouchableOpacity style={styles.dateField} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateText}>{birthDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={birthDate} mode="date" display="calendar" onChange={onChangeDate} maximumDate={new Date()} />
      )}

      {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Chargement...' : `S'inscrire`}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/auth/Login')}>
        <Text style={styles.link}>J'ai déjà un compte</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Label = ({ text, error }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{text}</Text>
    {error && <Text style={styles.labelError}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f9faff', padding: 24, paddingTop: 60, alignItems: 'stretch' },
  header: { fontSize: 28, fontWeight: '700', color: '#1f3a93', marginBottom: 32, alignSelf: 'center' },
  labelContainer: { marginBottom: 4 },
  label: { fontSize: 14, color: '#555', marginBottom: 2 },
  labelError: { fontSize: 12, color: 'red' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, borderWidth: 1, borderColor: '#ddd' },
  inputError: { borderColor: 'red' },
  dateField: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 24, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  dateText: { fontSize: 16, color: '#333' },
  button: { backgroundColor: '#1f3a93', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  formError: { color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 12 },
  link: { color: '#1f3a93', fontSize: 16, textDecorationLine: 'underline', alignSelf: 'center' }
});
