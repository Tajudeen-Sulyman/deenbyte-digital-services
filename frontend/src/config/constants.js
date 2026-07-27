export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const SERVICE_CATEGORIES = {
  AIRTIME: { label: 'Airtime', icon: 'bi-phone', code: 'AIRTIME_ALL' },
  DATA: { label: 'Data', icon: 'bi-wifi', code: 'DATA_ALL' },
  ELECTRICITY: { label: 'Electricity', icon: 'bi-lightning-charge', code: 'ELECTRICITY_ALL' },
  CABLE_TV: { label: 'Cable TV', icon: 'bi-tv', code: 'CABLE_TV_ALL' },
  NIN_VERIFICATION: { label: 'NIN Verification', icon: 'bi-person-vcard', code: 'NIN_VERIFICATION' },
  BVN_VERIFICATION: { label: 'BVN Verification', icon: 'bi-bank', code: 'BVN_VERIFICATION' },
  CAC_REGISTRATION: { label: 'CAC Registration', icon: 'bi-building', code: 'CAC_REGISTRATION' },
  WAEC_PIN: { label: 'WAEC PIN', icon: 'bi-mortarboard', code: 'WAEC_PIN' },
  NECO_PIN: { label: 'NECO PIN', icon: 'bi-journal-bookmark', code: 'NECO_PIN' },
  JAMB: { label: 'JAMB ePIN', icon: 'bi-pencil-square', code: 'JAMB_PIN' }
};
