import api from '@/lib/api';

// 1. Pour les statistiques du dashboard
export const getPaymentStatistics = async () => {
  try {
    console.log('🔄 Appel API: GET /commercial/dashboard/stats');
    const response = await api.get('/commercial/dashboard/stats');
    console.log('✅ Réponse stats brute:', response);
    console.log('✅ Réponse stats data:', response.data);
    return response.data.data || response.data;
  } catch (error: any) {
    console.error('❌ Erreur stats:', error);
    console.error('❌ Erreur details:', error.response?.data);
    throw error;
  }
};

// 2. Pour les utilisateurs qui ont utilisé votre code promo
export const getPromoUsers = async () => {
  try {
    console.log('🔄 Appel API: GET /commercial/promo-users');
    const response = await api.get('/commercial/promo-users');
    console.log('✅ Réponse promo-users brute:', response);
    console.log('✅ Réponse promo-users data:', response.data);

    if (response.data.data) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Erreur promo-users:', error);
    console.error('❌ Erreur details:', error.response?.data);
    throw error;
  }
};

// 3. Pour les paiements
export const getPayments = async () => {
  try {
    console.log('🔄 Appel API: GET /commercial/payments');
    const response = await api.get('/commercial/payments');
    console.log('✅ Réponse payments brute:', response);
    console.log('✅ Réponse payments data:', response.data);

    if (response.data.data) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Erreur payments:', error);
    console.error('❌ Erreur details:', error.response?.data);
    throw error;
  }
};

// Marquer un paiement en EN_ATTENTE (PENDING)
export const markPaymentAsPending = async (paymentId: number) => {
  const response = await api.put(`/commercial/payments/${paymentId}/mark-pending`);
  return response.data.data;
};

// Créer un paiement pour un utilisateur
export const createPayment = async (userId: number, paymentData: {
  planName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  receiptUrl?: string; // URL Cloudinary de la photo de preuve
}) => {
  try {
    console.log('🔄 Création paiement pour user:', userId);
    console.log('📝 Données:', paymentData);

    const response = await api.post(
      `/commercial/users/${userId}/create-payment`,
      {
        planName: paymentData.planName,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        paymentDate: paymentData.paymentDate,
        status: paymentData.status,
        receiptUrl: paymentData.receiptUrl || null
      }
    );

    console.log('✅ Paiement créé:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur création paiement:', error);
    console.error('❌ Response:', error.response);
    throw error;
  }
};

// Supprimer un paiement
export const deletePayment = async (paymentId: number) => {
  try {
    console.log('🔄 Suppression paiement:', paymentId);
    const response = await api.delete(`/commercial/payments/${paymentId}`);
    console.log('✅ Paiement supprimé:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur suppression paiement:', error);
    console.error('❌ Response:', error.response);
    throw error;
  }
};

// Créer un utilisateur (commercial crée un compte pour son client)
export const createUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  country: string;
  promoCode?: string;
}) => {
  try {
    console.log('🔄 Création utilisateur:', userData.email);
    const response = await api.post('/commercial/create-user', userData);
    console.log('✅ Utilisateur créé:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erreur création utilisateur:', error);
    console.error('❌ Response:', error.response);
    throw error;
  }
};

// Récupérer la liste des utilisateurs créés par le commercial (my-users)
export const getMyUsers = async () => {
  try {
    console.log('🔄 Appel API: GET /commercial/my-users');
    const response = await api.get('/commercial/my-users');
    console.log('✅ Réponse my-users:', response.data);

    if (response.data.data) {
      return response.data.data;
    }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error: any) {
    console.error('❌ Erreur my-users:', error);
    console.error('❌ Erreur details:', error.response?.data);
    throw error;
  }
};

// Récupérer le profil commercial
export const getCommercialProfile = async () => {
  try {
    console.log('📤 Récupération du profil...');
    const response = await api.get('/commercial/profile');
    console.log('✅ Profil reçu:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erreur profil:', error);
    throw error;
  }
};

// Mettre à jour le profil
export const updateCommercialProfile = async (profileData: {
  firstName?: string;
  lastName?: string;
  phone?: string;
}) => {
  try {
    console.log('📤 Mise à jour du profil:', profileData);
    const response = await api.put('/commercial/profile', profileData);
    console.log('✅ Profil mis à jour:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erreur mise à jour profil:', error);
    throw error;
  }
};

// Changer le mot de passe
export const changePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  try {
    console.log('📤 Changement de mot de passe...');
    const response = await api.put('/commercial/change-password', passwordData);
    console.log('✅ Mot de passe changé:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Erreur changement mot de passe:', error);
    throw error;
  }
};

// Get progression of all users linked to this commercial
export const getUsersProgression = async () => {
  try {
    const response = await api.get('/commercial/users-progression');
    return response.data.data || response.data || [];
  } catch (error: any) {
    console.error('❌ Erreur chargement progression utilisateurs:', error);
    throw error;
  }
};
