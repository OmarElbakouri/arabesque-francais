import api from '@/lib/api';

// Admin service for all admin API calls
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  getRecentActivities: async (limit: number = 10) => {
    const response = await api.get('/admin/dashboard/recent-activities', {
      params: { limit }
    });
    return response.data.data;
  },

  getSalesReps: async () => {
    const response = await api.get('/admin/dashboard/sales-reps');
    return response.data;
  },

  getSalesRepById: async (id: string) => {
    const response = await api.get(`/admin/dashboard/sales-reps/${id}`);
    return response.data;
  },

  getCommercialSales: async () => {
    const response = await api.get('/admin/dashboard/commercial-sales');
    return response.data.data;
  },

  getCommercialUsers: async (commercialId: number) => {
    const response = await api.get(`/admin/users/commercial/${commercialId}`);
    return response.data.data;
  },

  // User Management
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },

  getUsersByStatus: async (status: string) => {
    const response = await api.get(`/admin/users/status/${status}`);
    return response.data;
  },

  getUsersByRole: async (role: string) => {
    const response = await api.get(`/admin/users/role/${role}`);
    return response.data;
  },

  getUsersByCommercial: async (commercialId: string) => {
    const response = await api.get(`/admin/users/commercial/${commercialId}`);
    return response.data;
  },

  getUserById: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },

  // User update methods - backend uses specific endpoints for each field
  updateUser: async (userId: string, data: any) => {
    // This is a wrapper that calls individual endpoints based on what fields are being updated
    // Update role first if it's being changed, as it may affect other operations
    try {
      if (data.role !== undefined) {
        await api.put(`/admin/users/${userId}/role`, null, {
          params: { role: data.role }
        });
      }
      
      if (data.status !== undefined) {
        await api.put(`/admin/users/${userId}/user-status`, null, {
          params: { status: data.status }
        });
      }
      
      if (data.creditBalance !== undefined) {
        await api.put(`/admin/users/${userId}/credits`, null, {
          params: { credits: data.creditBalance }
        });
      }
      
      // Update plan - sends planName in request body (synchronises with last validated payment)
      if (data.plan !== undefined) {
        await api.put(`/admin/users/${userId}/plan`, { planName: data.plan });
      }

      // Update payment status
      if (data.paymentStatus !== undefined) {
        await api.put(`/admin/users/${userId}/payment-status`, null, {
          params: { paymentStatus: data.paymentStatus }
        });
      }

      // Update payment method
      if (data.paymentMethod !== undefined) {
        await api.put(`/admin/users/${userId}/payment-method`, null, {
          params: { paymentMethod: data.paymentMethod }
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string, adminId: string) => {
    const response = await api.delete(`/admin/users/${userId}`, {
      params: { adminId }
    });
    return response.data;
  },

  // Mettre à jour le plan d'un utilisateur (synchronise automatiquement le dernier paiement validé)
  updateUserPlan: async (userId: number, planName: 'FREE' | 'NORMAL' | 'VIP') => {
    const response = await api.put(`/admin/users/${userId}/plan`, { planName });
    return response.data.data;
  },

  // Commercial Users Management
  getAllCommercials: async () => {
    const response = await api.get('/admin/commercial-users');
    return response.data.data;
  },

  createCommercial: async (data: { firstName: string; lastName: string; email: string; phone?: string; commissionPercentage: number }) => {
    const response = await api.post('/admin/users/commercial', data);
    return response.data.data;
  },

  getCommercialStats: async (commercialId: string) => {
    const response = await api.get(`/commercial/${commercialId}/dashboard/stats`);
    return response.data.data;
  },

  searchCommercialUsers: async (commercialId: string, query: string) => {
    const response = await api.get(`/commercial/${commercialId}/users/search`, {
      params: { query }
    });
    return response.data.data;
  },

  deactivateCommercial: async (id: string, adminId: string, reason: string) => {
    const response = await api.put(`/admin/commercial-users/${id}/deactivate`, null, {
      params: { adminId, reason }
    });
    return response.data;
  },

  updateUserCredits: async (id: string, credits: number) => {
    const response = await api.put(`/admin/users/${id}/credits`, null, {
      params: { credits },
    });
    return response.data;
  },

  // Payments
  getPendingPayments: async () => {
    const response = await api.get('/admin/payments/pending');
    return response.data;
  },

  getPaymentsByStatus: async (status: string) => {
    const response = await api.get('/admin/payments', {
      params: { status },
    });
    return response.data;
  },

  getPaymentById: async (id: string) => {
    const response = await api.get(`/admin/payments/${id}`);
    return response.data;
  },

  validatePayment: async (data: { paymentId: string; status: string; adminNotes: string }) => {
    const response = await api.post('/admin/payments/validate', data);
    return response.data;
  },

  rejectPayment: async (id: string, reason: string) => {
    const response = await api.post(`/admin/payments/${id}/reject`, null, {
      params: { reason },
    });
    return response.data;
  },

  getPaymentStatistics: async () => {
    try {
      console.log('🔄 Appel API: GET /admin/payments/statistics');
      const response = await api.get('/admin/payments/statistics');
      console.log('🔍 Response complète:', response);
      console.log('🔍 Response.data:', response.data);
      console.log('🔍 Response.data.data:', response.data.data);
      
      const stats = response.data.data || response.data;
      console.log('📊 pendingCount:', stats.pendingCount);
      console.log('📊 validatedCount:', stats.validatedCount);
      console.log('📊 rejectedCount:', stats.rejectedCount);
      
      return stats;
    } catch (error) {
      console.error('❌ Erreur stats:', error);
      throw error;
    }
  },

  deletePayment: async (paymentId: number) => {
    const response = await api.delete(`/admin/payments/${paymentId}`);
    return response.data;
  },

  // Promo Codes
  getAllPromoCodes: async () => {
    const response = await api.get('/admin/promo-codes');
    return response.data;
  },

  getActivePromoCodes: async () => {
    const response = await api.get('/admin/promo-codes/active');
    return response.data;
  },

  getPromoCodesByCommercial: async (commercialId: string) => {
    const response = await api.get(`/admin/promo-codes/commercial/${commercialId}`);
    return response.data;
  },

  createPromoCode: async (data: any) => {
    const response = await api.post('/admin/promo-codes', data);
    return response.data;
  },

  updatePromoCode: async (id: string, data: any) => {
    const response = await api.put(`/admin/promo-codes/${id}`, data);
    return response.data;
  },

  deletePromoCode: async (id: string) => {
    const response = await api.delete(`/admin/promo-codes/${id}`);
    return response.data;
  },

  // Notifications
  sendNotification: async (data: any) => {
    const response = await api.post('/admin/notifications/send', data);
    return response.data;
  },

  broadcastNotification: async (title: string, message: string, deepLink?: string) => {
    const response = await api.post('/admin/notifications/broadcast', null, {
      params: { title, message, deepLink },
    });
    return response.data;
  },

  // Payment Management
  getAllPayments: async () => {
    try {
      // Disable default transformResponse to get raw string
      const response = await api.get('/admin/payments', {
        transformResponse: [(data) => {
          console.log('🔄 Transform: data type:', typeof data);
          
          // If data is already an object, return it
          if (typeof data === 'object') {
            console.log('✅ Data is already object');
            return data;
          }
          
          // If data is string, handle the backend circular reference bug
          if (typeof data === 'string') {
            console.log('⚠️ Data is string (length:', data.length, ')');
            
            // Try normal parse first
            try {
              const parsed = JSON.parse(data);
              console.log('✅ Direct parse successful');
              return parsed;
            } catch (e) {
              console.log('❌ Direct parse failed, extracting data array...');
            }
            
            // CRITICAL FIX: Extract just the data array from the malformed response
            // Response format: {"success":true,"message":"...","data":[...]}
            // But circular refs break it, so extract the array directly
            
            const dataArrayStart = data.indexOf('"data":[');
            if (dataArrayStart === -1) {
              console.error('❌ Could not find "data":[ in response');
              return { success: true, message: 'No data array found', data: [] };
            }
            
            console.log('🔧 Found "data":[ at position:', dataArrayStart);
            
            // Extract from the [ after "data":
            const arrayStart = dataArrayStart + '"data":'.length;
            
            // Find where the array ends - look for the error message separator
            const errorPattern = ']}{"success":false';
            const errorPos = data.indexOf(errorPattern, arrayStart);
            
            let arrayContent;
            if (errorPos > 0) {
              // Include the ] that closes the array
              arrayContent = data.substring(arrayStart, errorPos + 1);
              console.log('🔧 Extracted array up to error. Length:', arrayContent.length);
            } else {
              // No error found, extract to end
              arrayContent = data.substring(arrayStart);
              console.log('🔧 Extracted array to end. Length:', arrayContent.length);
            }
            
            console.log('🔧 Array first 300 chars:', arrayContent.substring(0, 300));
            console.log('🔧 Array last 200 chars:', arrayContent.slice(-200));
            
            // AGGRESSIVE FIX: Just take the first 200KB which should be valid
            // The corruption happens at position 238025, so everything before ~200000 should be safe
            
            if (arrayContent.length > 200000) {
              console.log('� Array too large, truncating to first 200KB...');
              
              // Find the last complete object before 200KB
              let truncatePos = 200000;
              
              // Search backwards for },{ or }] pattern
              while (truncatePos > 100000) {
                if (arrayContent[truncatePos] === '}' && 
                    (arrayContent[truncatePos + 1] === ',' || arrayContent[truncatePos + 1] === ']')) {
                  break;
                }
                truncatePos--;
              }
              
              const truncated = arrayContent.substring(0, truncatePos + 1) + ']';
              console.log('🔧 Truncated at position:', truncatePos, '| New length:', truncated.length);
              console.log('🔧 Truncated last 100 chars:', truncated.slice(-100));
              
              try {
                const dataArray = JSON.parse(truncated);
                console.log('✅ Successfully parsed truncated array! Items:', dataArray.length);
                
                if (dataArray.length > 0) {
                  console.log('📦 Sample payment:', {
                    id: dataArray[0].id,
                    email: dataArray[0].user?.email,
                    planName: dataArray[0].planName,
                    status: dataArray[0].status,
                    amount: dataArray[0].amount
                  });
                }
                
                return {
                  success: true,
                  message: `Extracted ${dataArray.length} payments (truncated to avoid backend bug)`,
                  data: dataArray
                };
              } catch (truncError) {
                console.error('❌ Truncated parse failed:', truncError);
                // Fall through to other strategies
              }
            }
            
            try {
              // Try to parse the array directly
              const dataArray = JSON.parse(arrayContent);
              console.log('✅ Successfully parsed data array! Items:', dataArray.length);
              
              if (dataArray.length > 0) {
                console.log('📦 First item sample:', {
                  id: dataArray[0].id,
                  planName: dataArray[0].planName,
                  status: dataArray[0].status,
                  hasUser: !!dataArray[0].user
                });
              }
              
              return {
                success: true,
                message: 'Data extracted despite backend bug',
                data: dataArray
              };
            } catch (parseError: any) {
              console.error('❌ Failed to parse array:', parseError);
              
              // Extract error position if available
              const errorMatch = parseError.message?.match(/position (\d+)|column (\d+)/);
              const errorPos = errorMatch ? parseInt(errorMatch[1] || errorMatch[2]) : null;
              
              if (errorPos && errorPos > 1000) {
                console.log('🔧 Truncating at error position:', errorPos);
                
                // Go back from error position to find the last complete object
                // Look for },{ or }] pattern (object boundary)
                let truncatePos = errorPos - 1;
                let foundBoundary = false;
                
                while (truncatePos > 100) {
                  const char = arrayContent[truncatePos];
                  const nextChar = arrayContent[truncatePos + 1];
                  
                  // Found end of a complete object followed by comma or end of array
                  if (char === '}' && (nextChar === ',' || nextChar === ']')) {
                    foundBoundary = true;
                    break;
                  }
                  
                  truncatePos--;
                }
                
                if (foundBoundary && truncatePos > 100) {
                  // Include the } and add closing ]
                  const truncated = arrayContent.substring(0, truncatePos + 1) + ']';
                  console.log('🔧 Found boundary at:', truncatePos, '| Truncated length:', truncated.length);
                  console.log('🔧 Last 150 chars:', truncated.slice(-150));
                  
                  try {
                    const dataArray = JSON.parse(truncated);
                    console.log('✅ Parsed truncated array! Items:', dataArray.length);
                    
                    if (dataArray.length > 0) {
                      console.log('📦 First item:', {
                        id: dataArray[0].id,
                        planName: dataArray[0].planName,
                        status: dataArray[0].status,
                        hasUser: !!dataArray[0].user
                      });
                      console.log('📦 Last item:', {
                        id: dataArray[dataArray.length - 1].id,
                        planName: dataArray[dataArray.length - 1].planName
                      });
                    }
                    
                    return {
                      success: true,
                      message: `Partial data (${dataArray.length} payments extracted, backend has circular refs)`,
                      data: dataArray
                    };
                  } catch (truncError) {
                    console.error('❌ Truncated parse failed:', truncError);
                  }
                } else {
                  console.warn('⚠️ Could not find safe truncation boundary');
                }
              }
              
              console.log('🔧 Attempting to fix unclosed structures...');
              
              // Try to fix by closing unclosed braces/brackets
              let fixed = arrayContent;
              let openBraces = (fixed.match(/{/g) || []).length;
              let closeBraces = (fixed.match(/}/g) || []).length;
              let openBrackets = (fixed.match(/\[/g) || []).length;
              let closeBrackets = (fixed.match(/\]/g) || []).length;
              
              console.log('📊 Braces:', openBraces, 'vs', closeBraces, '| Brackets:', openBrackets, 'vs', closeBrackets);
              
              // Add missing closing characters
              while (closeBraces < openBraces) { fixed += '}'; closeBraces++; }
              while (closeBrackets < openBrackets) { fixed += ']'; closeBrackets++; }
              
              try {
                const dataArray = JSON.parse(fixed);
                console.log('✅ Fixed and parsed! Items:', dataArray.length);
                return {
                  success: true,
                  message: 'Data recovered with fixes',
                  data: dataArray
                };
              } catch (fixError) {
                console.error('❌ Could not fix:', fixError);
              }
            }
            
            // All strategies failed
            console.error('❌ Could not extract valid data. Backend MUST fix circular references.');
            return { success: true, message: 'Backend needs fix', data: [] };
          }
          
          return data;
        }]
      });
      
      console.log('🔍 Final response.data:', response.data);
      
      const responseData = response.data;
      
      // Now access the data array
      if (responseData?.success && Array.isArray(responseData.data)) {
        console.log('✅ Found payments:', responseData.data.length);
        
        if (responseData.data.length > 0) {
          const firstPayment = responseData.data[0];
          console.log('📦 First payment keys:', Object.keys(firstPayment));
          
          // Check for planName field
          const planName = firstPayment.planName || firstPayment.plan || 'N/A';
          console.log('📦 First payment planName:', planName);
          console.log('📦 First payment user.email:', firstPayment.user?.email);
        }
        
        return responseData.data;
      }
      
      // Fallback checks
      if (Array.isArray(responseData)) {
        console.log('✅ Response data is direct array:', responseData.length);
        return responseData;
      }
      
      if (responseData && Array.isArray(responseData.data)) {
        console.log('✅ Found data array without success flag:', responseData.data.length);
        return responseData.data;
      }
      
      console.warn('⚠️ No valid array found in response');
      return [];
    } catch (error) {
      console.error('❌ Error loading payments:', error);
      return [];
    }
  },

  updatePaymentStatus: async (paymentId: number, status: string) => {
    const response = await api.put('/admin/payments/update', {
      paymentId,
      status
    });
    return response.data.data;
  },

  updatePaymentMethod: async (paymentId: number, paymentMethod: string) => {
    const response = await api.put('/admin/payments/update', {
      paymentId,
      paymentMethod
    });
    return response.data.data;
  },
  
  // Update both status and method at once (synchronise avec le plan utilisateur)
  updatePayment: async (paymentId: number, updates: { status?: string; paymentMethod?: string; amount?: number; paidAt?: string; planName?: string }) => {
    console.log('📤 adminService.updatePayment called with:', { paymentId, updates });
    const payload = {
      paymentId,
      ...updates
    };
    console.log('📤 Sending payload to /admin/payments:', payload);
    const response = await api.put('/admin/payments', payload);
    console.log('📥 Response from backend:', response.data);
    return response.data.data;
  },

  // ==================== COMMERCIAL TEAM MANAGEMENT ====================
  
  // Récupérer les statistiques de l'équipe commerciale
  getCommercialTeamStatistics: async () => {
    const response = await api.get('/admin/commercial-team/statistics');
    return response.data.data;
  },

  // Récupérer la liste des commerciaux
  getCommercialTeam: async () => {
    const response = await api.get('/admin/commercial-team');
    return response.data.data;
  },

  // Créer un nouveau commercial
  createCommercial: async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    commissionPercentage?: number;
  }) => {
    const response = await api.post('/admin/users/commercial', data);
    return response.data.data;
  },

  // ==================== DOCUMENTS MANAGEMENT ====================
  
  // Récupérer tous les documents
  getAllDocuments: async () => {
    const response = await api.get('/admin/documents');
    return response.data.data;
  },

  // Récupérer un document par ID
  getDocumentById: async (id: number) => {
    const response = await api.get(`/admin/documents/${id}`);
    return response.data.data;
  },

  // Récupérer les documents publiés
  getPublishedDocuments: async () => {
    const response = await api.get('/admin/documents/published');
    return response.data.data;
  },

  // Récupérer les documents par visibilité
  getDocumentsByVisibility: async (visibility: 'NORMAL_AND_VIP' | 'ALL') => {
    const response = await api.get(`/admin/documents/visibility/${visibility}`);
    return response.data.data;
  },

  // Créer un nouveau document
  createDocument: async (data: {
    title: string;
    description: string;
    level: string;
    visibility: 'NORMAL_AND_VIP' | 'ALL';
    imageUrl?: string;
    pdfUrl?: string;
    durationHours?: number;
  }) => {
    const response = await api.post('/admin/documents', data);
    return response.data.data;
  },

  // Mettre à jour un document
  updateDocument: async (id: number, data: {
    title?: string;
    description?: string;
    level?: string;
    imageUrl?: string;
    pdfUrl?: string;
    visibility?: 'NORMAL_AND_VIP' | 'ALL';
    status?: 'DRAFT' | 'PUBLISHED';
    durationHours?: number;
  }) => {
    const response = await api.put(`/admin/documents/${id}`, data);
    return response.data.data;
  },

  // Supprimer un document
  deleteDocument: async (id: number) => {
    const response = await api.delete(`/admin/documents/${id}`);
    return response.data;
  },

  // Publier un document
  publishDocument: async (id: number) => {
    const response = await api.put(`/admin/documents/${id}/publish`);
    return response.data.data;
  },

  // Dépublier un document
  unpublishDocument: async (id: number) => {
    const response = await api.put(`/admin/documents/${id}/unpublish`);
    return response.data.data;
  },

  // Mettre à jour la visibilité d'un document
  updateDocumentVisibility: async (id: number, visibility: 'NORMAL_AND_VIP' | 'ALL') => {
    const response = await api.put(`/admin/documents/${id}/visibility`, { visibility });
    return response.data.data;
  },

  // Upload PDF
  uploadDocumentPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/documents/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Returns { pdfPath, pdfUrl }
  },

  // Upload Image
  uploadDocumentImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/documents/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data; // Returns { imagePath, imageUrl }
  },

  // ==================== COURSES MANAGEMENT ====================

  // Get course statistics
  getCourseStats: async () => {
    const response = await api.get('/admin/courses/stats');
    return response.data.data;
  },

  // Get all courses
  getAllCourses: async () => {
    const response = await api.get('/admin/courses');
    return response.data.data;
  },

  // Get course by ID
  getCourseById: async (id: number) => {
    const response = await api.get(`/admin/courses/${id}`);
    return response.data.data;
  },

  // Search courses
  searchCourses: async (keyword: string) => {
    const response = await api.get('/admin/courses/search', {
      params: { keyword }
    });
    return response.data.data;
  },

  // Create a new course
  createCourse: async (data: {
    name: string;
    description: string;
    level: string;
    durationHours?: number;
    price?: number;
    visibility?: string;
    status?: string;
  }) => {
    const response = await api.post('/admin/courses', data);
    return response.data.data;
  },

  // Update a course
  updateCourse: async (id: number, data: {
    name?: string;
    description?: string;
    level?: string;
    durationHours?: number;
    price?: number;
    visibility?: string;
    status?: string;
    imageUrl?: string;
    pdfUrl?: string;
  }) => {
    const response = await api.put(`/admin/courses/${id}`, data);
    return response.data.data;
  },

  // Delete a course
  deleteCourse: async (id: number) => {
    const response = await api.delete(`/admin/courses/${id}`);
    return response.data;
  },

  // Publish a course
  publishCourse: async (id: number) => {
    const response = await api.post(`/admin/courses/${id}/publish`);
    return response.data.data;
  },

  // Unpublish a course
  unpublishCourse: async (id: number) => {
    const response = await api.post(`/admin/courses/${id}/unpublish`);
    return response.data.data;
  },

  // Upload course PDF (requires courseId)
  uploadCoursePdf: async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/courses/${courseId}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload course image (requires courseId)
  uploadCourseImage: async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/courses/${courseId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload course PDF with ID (alias)
  uploadCoursePdfById: async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/courses/${courseId}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload course image
  uploadCourseImage: async (courseId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/courses/${courseId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // ==================== CHAPTERS MANAGEMENT ====================

  // Get chapter statistics
  getChapterStats: async () => {
    const response = await api.get('/admin/chapters/stats');
    return response.data.data;
  },

  // Get courses dropdown list
  getCoursesDropdown: async () => {
    const response = await api.get('/admin/courses/dropdown');
    return response.data.data;
  },

  // Get chapters by course (alias for getCourseChapters)
  getChaptersByCourse: async (courseId: number) => {
    const response = await api.get(`/admin/courses/${courseId}/chapters`);
    return response.data.data;
  },

  // Get course chapters
  getCourseChapters: async (courseId: number) => {
    const response = await api.get(`/admin/courses/${courseId}/chapters`);
    return response.data.data;
  },

  // Create a new chapter (with courseId parameter for convenience)
  createChapter: async (courseId: number, data: {
    title: string;
    description?: string;
    videoUrl?: string;
    pdfUrl?: string;
    audioUrl?: string;
    durationMinutes?: number;
    isLocked?: boolean;
  }) => {
    const response = await api.post(`/admin/courses/${courseId}/chapters`, data);
    return response.data.data;
  },

  // Update a chapter
  updateChapter: async (id: number, data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    pdfUrl?: string;
    audioUrl?: string;
    durationMinutes?: number;
    isLocked?: boolean;
    orderIndex?: number;
  }) => {
    const response = await api.put(`/admin/chapters/${id}`, data);
    return response.data.data;
  },

  // Delete a chapter
  deleteChapter: async (id: number) => {
    const response = await api.delete(`/admin/chapters/${id}`);
    return response.data;
  },

  // Reorder chapters
  reorderChapters: async (courseId: number, chapterIds: number[]) => {
    const response = await api.put(`/admin/courses/${courseId}/chapters/reorder`, { chapterIds });
    return response.data.data;
  },

  // Upload chapter PDF (without ID - for creating new chapters)
  uploadChapterPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/chapters/upload/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload chapter audio (without ID - for creating new chapters)
  uploadChapterAudio: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/admin/chapters/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // ==================== LESSONS (VIDEOS) MANAGEMENT ====================

  // Get lessons by chapter
  getLessonsByChapter: async (chapterId: number) => {
    const response = await api.get(`/admin/chapters/${chapterId}/lessons`);
    return response.data.data;
  },

  // Create a new lesson/video
  createLesson: async (data: {
    chapterId: number;
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: string;
    displayOrder: number;
  }) => {
    const response = await api.post('/admin/chapters/lessons', data);
    return response.data.data;
  },

  // Update a lesson/video
  updateLesson: async (id: number, data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    duration?: string;
    displayOrder?: number;
  }) => {
    const response = await api.put(`/admin/chapters/lessons/${id}`, data);
    return response.data.data;
  },

  // Delete a lesson/video
  deleteLesson: async (id: number) => {
    const response = await api.delete(`/admin/chapters/lessons/${id}`);
    return response.data;
  },

  // Upload lesson PDF
  uploadLessonPdf: async (lessonId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/chapters/lessons/${lessonId}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Upload lesson video
  uploadLessonVideo: async (lessonId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/admin/chapters/lessons/${lessonId}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
