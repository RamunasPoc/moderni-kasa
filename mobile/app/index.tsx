import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  isDeviceEnrolled,
  verifyPin,
  isBiometricsEnabled,
  authenticateWithBiometrics,
  getStoredEmployee,
  clearDeviceSession,
  EmployeeInfo,
} from '../services/security';

export default function LockScreen() {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [pin, setPin] = useState('');
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ----------------------------------------------------
  // 1. ĮRENGINIO BŪSENOS PATIKRINIMAS PALEIDŽIANT
  // ----------------------------------------------------
  useEffect(() => {
    initLockScreen();
  }, []);

  const initLockScreen = async () => {
    setIsChecking(true);
    const enrolled = await isDeviceEnrolled();

    // Jei įrenginys neaktyvuotas - nukreipiame į aktyvavimo ekraną
    if (!enrolled) {
      router.replace('/activate');
      return;
    }

    // Gauname darbuotojo duomenis
    const empData = await getStoredEmployee();
    setEmployee(empData);

    // Patikriname, ar įjungta biometrija
    const bioEnabled = await isBiometricsEnabled();
    setBiometricsAvailable(bioEnabled);

    setIsChecking(false);

    // Jei biometrija įjungta - iškart iškviečiame Face ID / Fingerprint
    if (bioEnabled) {
      triggerBiometrics();
    }
  };

  // ----------------------------------------------------
  // 2. BIOMETRIJOS AUTENTIFIKAVIMAS
  // ----------------------------------------------------
  const triggerBiometrics = async () => {
    const success = await authenticateWithBiometrics('Atrakinkite kasos sistemą');
    if (success) {
      unlockApp();
    }
  };

  // ----------------------------------------------------
  // 3. PIN KODO ĮVEDIMAS
  // ----------------------------------------------------
  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setErrorMsg('');

      // Kai suvedami visi 4 skaitmenys - tikriname iškart
      if (newPin.length === 4) {
        checkEnteredPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const checkEnteredPin = async (inputPin: string) => {
    const isValid = await verifyPin(inputPin);
    if (isValid) {
      unlockApp();
    } else {
      setErrorMsg('Neteisingas PIN kodas');
      setPin('');
    }
  };

  // Sėkmingas atsirakinimas - nukreipiame į kasos ekraną
  const unlockApp = () => {
    router.replace('/pos');
  };

  // Įrenginio atsiejimas (pvz. keičiantis darbuotojui)
  const handleResetDevice = () => {
    Alert.alert(
      'Atsieti įrenginį?',
      'Ar tikrai norite pašalinti šio įrenginio registraciją ir prisijungti iš naujo?',
      [
        { text: 'Atšaukti', style: 'cancel' },
        {
          text: 'Atsieti',
          style: 'destructive',
          onPress: async () => {
            await clearDeviceSession();
            router.replace('/activate');
          },
        },
      ]
    );
  };

  if (isChecking) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{employee?.companyName || 'MODERNI KASA'}</Text>
        <Text style={styles.welcomeText}>
          Sveiki, <Text style={styles.employeeName}>{employee?.name || 'Kasininke'}</Text>
        </Text>
        <Text style={styles.instruction}>Įveskite PIN kodą arba naudokite biometriją</Text>
      </View>

      {/* PIN RUTULIUKAI */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              pin.length > index && styles.dotFilled,
              errorMsg ? styles.dotError : null,
            ]}
          />
        ))}
      </View>

      {/* KLAIDOS PRANEŠIMAS */}
      <Text style={styles.errorText}>{errorMsg || ' '}</Text>

      {/* SKAITMENINĖ KLAVIATŪRA */}
      <View style={styles.keypad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keyButton}
                onPress={() => handleKeyPress(num)}
              >
                <Text style={styles.keyText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* APATINĖ EILUTĖ (Biometrija - 0 - Trinti) */}
        <View style={styles.keypadRow}>
          {biometricsAvailable ? (
            <TouchableOpacity style={styles.actionKeyButton} onPress={triggerBiometrics}>
              <Text style={styles.actionKeyText}>👤</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyKey} />
          )}

          <TouchableOpacity style={styles.keyButton} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionKeyButton} onPress={handleDelete}>
            <Text style={styles.actionKeyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ATSIETI ĮRENGINĮ */}
      <TouchableOpacity style={styles.resetButton} onPress={handleResetDevice}>
        <Text style={styles.resetButtonText}>Atsieti įrenginį</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  welcomeText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '500',
  },
  employeeName: {
    fontWeight: '800',
  },
  instruction: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginHorizontal: 12,
  },
  dotFilled: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  dotError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    height: 20,
  },
  keypad: {
    paddingHorizontal: 40,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionKeyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionKeyText: {
    fontSize: 22,
    color: '#334155',
  },
  emptyKey: {
    width: 72,
    height: 72,
  },
  resetButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  resetButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
});