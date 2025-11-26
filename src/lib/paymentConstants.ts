// Mapping des statuts de paiement (Frontend FR → Backend EN)
export const PAYMENT_STATUS_MAP: { [key: string]: string } = {
  'EN_ATTENTE': 'PENDING',
  'ACCEPTE': 'VALIDATED',
  'REFUSE': 'REJECTED',
  'ANNULE': 'CANCELLED'
};

// Mapping inverse pour l'affichage (Backend EN → Frontend FR)
export const PAYMENT_STATUS_DISPLAY: { [key: string]: string } = {
  'PENDING': 'EN_ATTENTE',
  'VALIDATED': 'ACCEPTE',
  'REJECTED': 'REFUSE',
  'CANCELLED': 'ANNULE',
  // Garder aussi les valeurs FR au cas où
  'EN_ATTENTE': 'EN_ATTENTE',
  'ACCEPTE': 'ACCEPTE',
  'REFUSE': 'REFUSE',
  'ANNULE': 'ANNULE'
};

// Mapping des méthodes de paiement (Frontend FR → Backend EN)
export const PAYMENT_METHOD_MAP: { [key: string]: string } = {
  'VIREMENT': 'BANK_TRANSFER',
  'ESPECES': 'CASH',
  'CHEQUE': 'CHECK',
  'MOBILE': 'MOBILE'
};

// Mapping inverse pour l'affichage (Backend EN → Frontend FR)
export const PAYMENT_METHOD_DISPLAY: { [key: string]: string } = {
  'BANK_TRANSFER': 'VIREMENT',
  'CASH': 'ESPECES',
  'CHECK': 'CHEQUE',
  'MOBILE': 'MOBILE',
  // Garder aussi les valeurs FR au cas où
  'VIREMENT': 'VIREMENT',
  'ESPECES': 'ESPECES',
  'CHEQUE': 'CHEQUE'
};
