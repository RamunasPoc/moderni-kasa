import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { saveEnrollment, checkBiometricsSupport } from '../services/security';

// Kompiuterio IP adresas, kur veikia Next.js serveris
const API_BASE_URL = 'http://192.168.0.125:3000/api';

export default function ActivateScreen() {
  const router = useRouter();

  // Aktyvavimo žingsniai: 1 - Kodas/QR, 2 - PIN kodo sugalvojimas, 3 - Biometrija
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Duomenų būsenos
  const [activationCode, setActivationCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Vartotojo ir įmonės informacija
  const [employeeInfo, setEmployeeInfo] = useState<{ 
    id: string; 
    name: string; 
    role: string; 
    companyId: string; 
    companyName: string 
  } | null>(null);
  
  const [deviceToken, setDeviceToken] = useState('');

  // Kameros valdymas QR skenavimui
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Biometrijos tikrinimas
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    (async () => {
      const bio = await checkBiometricsSupport();
      setHasBiometrics(bio.hasHardware && bio.isEnrolled);
    })();
  }, []);

  // ----------------------------------------------------
  // 1 ŽINGSNIS: Aktyvavimo kodo tikrinimas / API kvietimas
  // ----------------------------------------------------
  const handleVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) {
      Alert.alert('Klaida', 'Įveskite arba nuskenuokite aktyvavimo kodą.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pos/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationCode: codeToVerify.trim() }),
      });
      
      const data = await response.json();

      if (data.success) {
        setDeviceToken(data.deviceToken);
        setEmployeeInfo({
          id: data.employee.id,
          name: data.employee.name,
          role: data.employee.role,
          companyId: data.employee.companyId,
          companyName: data.employee.companyName,
        });
        setIsScanningQR(false);
        setStep(2); // Pereiname prie PIN kodo sugalvojimo
      } else {
        Alert.alert('Aktyvavimo klaida', data.error || 'Neteisingas arba negaliojantis aktyvavimo kodas.');
      }
    } catch (error) {
      console.error('Klaida jungiantis prie serverio:', error);
      Alert.alert('Tinklo klaida', 'Nepavyko susisiekti su serveriu. Patikrinkite IP adresą ir ryšį.');
    } finally {
      setLoading(false);
    }
  };

  // QR Kodo skenavimo apdorojimas
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setIsScanningQR(false);
    setActivationCode(data);
    handleVerifyCode(data);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const granted = await requestPermission();
      if (!granted.granted) {
        Alert.alert('Leidimas atmestas', 'Reikalingas leidimas naudoti kamerą QR kodų skenavimui.');
        return;
      }
    }
    setIsScanningQR(true);
  };

  // ----------------------------------------------------
  // 2 ŽINGSNIS: PIN kodo patvirtinimas
  // ----------------------------------------------------
  const handleSetPin = () => {
    if (pin.length < 4) {
      Alert.alert('Klaida', 'PIN kodas turi susidėti iš bent 4 skaitmenų.');
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert('Klaida', 'PIN kodai nesutampa.');
      return;
    }

    if (hasBiometrics) {
      setStep(3); // Pereiname prie biometrijos įjungimo
    } else {
      finalizeEnrollment(false);
    }
  };

  // ----------------------------------------------------
  // 3 ŽINGSNIS: Užbaigimas ir duomenų įrašymas į SecureStore
  // ----------------------------------------------------
  const finalizeEnrollment = async (enableBiometrics: boolean) => {
    if (!employeeInfo || !deviceToken) return;

    setLoading(true);
    try {
      await saveEnrollment(deviceToken, pin, employeeInfo, enableBiometrics);
      Alert.alert('Sėkmingai!', `Sveiki atvykę, ${employeeInfo.name}! Įrenginys sėkmingai paruoštas.`, [
        {
          text: 'Pradėti darbą',
          onPress: () => router.replace('/pos'),
        },
      ]);
    } catch (err) {
      console.error('Išsaugojimo klaida:', err);
      Alert.alert('Klaida', 'Nepavyko išsaugoti aktyvavimo duomenų.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoTitle}>MODERNI KASA</Text>
        <Text style={styles.subtitle}>Įrenginio aktyvavimas</Text>

        {/* ----------------- 1 ŽINGSNIS: AKTYVAVIMAS ----------------- */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pirmasis prisijungimas</Text>
            <Text style={styles.cardDesc}>
              Įveskite administratoriaus suteiktą aktyvavimo kodą arba nuskenuokite QR kodą.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Aktyvavimo kodas (Vartotojo ID)"
              placeholderTextColor="#94A3B8"
              value={activationCode}
              onChangeText={setActivationCode}
              autoCapitalize="none"
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleVerifyCode(activationCode)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Patikrinti kodą</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ARBA</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={openCamera}>
              <Text style={styles.secondaryButtonText}>📷 Skenuoti QR kodą</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------- 2 ŽINGSNIS: PIN KODAS ----------------- */}
        {step === 2 && employeeInfo && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sugalvokite PIN kodą</Text>
            <Text style={styles.cardDesc}>
              Paskyra: <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>{employeeInfo.name}</Text> ({employeeInfo.companyName})
            </Text>

            <Text style={styles.label}>Naujas PIN kodas (skaičiai)</Text>
            <TextInput
              style={styles.input}
              placeholder="****"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={pin}
              onChangeText={setPin}
            />

            <Text style={styles.label}>Pakartokite PIN kodą</Text>
            <TextInput
              style={styles.input}
              placeholder="****"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={6}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleSetPin}>
              <Text style={styles.primaryButtonText}>Tęsti</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------- 3 ŽINGSNIS: BIOMETRIJA ----------------- */}
        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Biometrinis prisijungimas</Text>
            <Text style={styles.cardDesc}>
              Ar norite naudoti Face ID arba piršto atspaudą greitam kasos atsirakinimui?
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => finalizeEnrollment(true)}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>Įjungti Face ID / Piršto atspaudą</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { marginTop: 12 }]}
              onPress={() => finalizeEnrollment(false)}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Naudoti tik PIN kodą</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ----------------- QR SKENERIO MODALINIS LANGAS ----------------- */}
      <Modal visible={isScanningQR} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
          />
          <View style={styles.qrOverlay}>
            <Text style={styles.qrTitle}>Nukreipkite kamerą į QR kodą</Text>
            <TouchableOpacity
              style={styles.closeQrButton}
              onPress={() => setIsScanningQR(false)}
            >
              <Text style={styles.closeQrText}>Uždaryti</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  logoTitle: { fontSize: 28, fontWeight: '900', color: '#2563EB', textAlign: 'center', letterSpacing: 2 },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 32, marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#64748B', marginBottom: 20, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0F172A', marginBottom: 16, fontWeight: '600' },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#F1F5F9', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  secondaryButtonText: { color: '#334155', fontSize: 15, fontWeight: '600' },
  qrOverlay: { position: 'absolute', bottom: 50, left: 20, right: 20, alignItems: 'center' },
  qrTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  closeQrButton: { backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  closeQrText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});