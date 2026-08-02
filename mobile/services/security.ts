import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Saugomų raktų pavadinimai
const KEYS = {
  DEVICE_TOKEN: 'moderni_kasa_device_token',
  USER_PIN: 'moderni_kasa_user_pin',
  BIOMETRICS_ENABLED: 'moderni_kasa_biometrics_enabled',
  EMPLOYEE_INFO: 'moderni_kasa_employee_info',
};

export interface EmployeeInfo {
  id: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
}

// ==========================================
// 1. ŠIFRUOTAS DUOMENŲ SAUGOJIMAS (Keychain / KeyStore)
// ==========================================

export const saveSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Klaida įrašant raktą ${key}:`, error);
    throw error;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Klaida nuskaitant raktą ${key}:`, error);
    return null;
  }
};

export const deleteSecureItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Klaida trinant raktą ${key}:`, error);
  }
};

// ==========================================
// 2. BIOMETRIJOS VALDYMAS (Face ID / Fingerprint)
// ==========================================

/**
 * Patikrina, ar įrenginys turi biometrijos jutiklį ir ar jis aktyvuotas (pridėtas veidas/pirštas).
 */
export const checkBiometricsSupport = async (): Promise<{
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

  return { hasHardware, isEnrolled, supportedTypes };
};

/**
 * Iškviečia sisteminį Face ID / Piršto atspaudo langą.
 */
export const authenticateWithBiometrics = async (
  promptMessage: string = 'Prisijunkite prie kasos sistemos'
): Promise<boolean> => {
  try {
    const { hasHardware, isEnrolled } = await checkBiometricsSupport();
    if (!hasHardware || !isEnrolled) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Įvesti PIN kodą',
      disableDeviceFallback: true, // Reikalaujame būtent įrenginio biometrijos arba mūsų PIN
    });

    return result.success;
  } catch (error) {
    console.error('Biometrinio autentiškumo patvirtinimo klaida:', error);
    return false;
  }
};

// ==========================================
// 3. DARBUOTOJO SESIJOS IR AKTYVAVIMO LOGIKA
// ==========================================

/**
 * Įrašo pirminio aktyvavimo duomenis (Įrenginio žetoną, PIN kodą ir Darbuotojo info)
 */
export const saveEnrollment = async (
  deviceToken: string,
  pin: string,
  employee: EmployeeInfo,
  enableBiometrics: boolean = false
): Promise<void> => {
  await saveSecureItem(KEYS.DEVICE_TOKEN, deviceToken);
  await saveSecureItem(KEYS.USER_PIN, pin);
  await saveSecureItem(KEYS.EMPLOYEE_INFO, JSON.stringify(employee));
  await saveSecureItem(KEYS.BIOMETRICS_ENABLED, enableBiometrics ? 'true' : 'false');
};

/**
 * Patikrina, ar įrenginys jau yra registruotas/aktyvuotas
 */
export const isDeviceEnrolled = async (): Promise<boolean> => {
  const token = await getSecureItem(KEYS.DEVICE_TOKEN);
  const pin = await getSecureItem(KEYS.USER_PIN);
  return !!(token && pin);
};

/**
 * Patikrina, ar įvestas PIN kodas sutampa su išsaugotuoju
 */
export const verifyPin = async (inputPin: string): Promise<boolean> => {
  const savedPin = await getSecureItem(KEYS.USER_PIN);
  return savedPin === inputPin;
};

/**
 * Patikrina, ar aktyvuotas biometrinis prisijungimas
 */
export const isBiometricsEnabled = async (): Promise<boolean> => {
  const val = await getSecureItem(KEYS.BIOMETRICS_ENABLED);
  return val === 'true';
};

/**
 * Nustato biometrinio prisijungimo būseną
 */
export const setBiometricsEnabled = async (enabled: boolean): Promise<void> => {
  await saveSecureItem(KEYS.BIOMETRICS_ENABLED, enabled ? 'true' : 'false');
};

/**
 * Gauna išsaugotus darbuotojo duomenis
 */
export const getStoredEmployee = async (): Promise<EmployeeInfo | null> => {
  const json = await getSecureItem(KEYS.EMPLOYEE_INFO);
  if (!json) return null;
  try {
    return JSON.parse(json) as EmployeeInfo;
  } catch {
    return null;
  }
};

/**
 * Pilnai atsieja įrenginį (Atsijungimas / Reset)
 */
export const clearDeviceSession = async (): Promise<void> => {
  await deleteSecureItem(KEYS.DEVICE_TOKEN);
  await deleteSecureItem(KEYS.USER_PIN);
  await deleteSecureItem(KEYS.EMPLOYEE_INFO);
  await deleteSecureItem(KEYS.BIOMETRICS_ENABLED);
};