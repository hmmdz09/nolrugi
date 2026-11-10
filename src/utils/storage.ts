import { InventoryBatch } from '../types';
import { getInitialBatches } from '../data/initialData';

const STORAGE_KEY = 'nolrugi_inventory_batches_v1';
const CONSENT_KEY = 'nolrugi_uupdp_consent';

export const loadBatches = (): InventoryBatch[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialBatches();
      saveBatches(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load batches from localStorage', e);
    return getInitialBatches();
  }
};

export const saveBatches = (batches: InventoryBatch[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch (e) {
    console.error('Failed to save batches to localStorage', e);
  }
};

export const resetToDefaults = (): InventoryBatch[] => {
  const initial = getInitialBatches();
  saveBatches(initial);
  return initial;
};

export const loadConsent = (): boolean => {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw !== null ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
};

export const saveConsent = (consent: boolean): void => {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch (e) {
    console.error('Failed to save consent', e);
  }
};
