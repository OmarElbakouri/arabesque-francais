import api from '@/lib/api';
import { getDeviceFingerprint, detectDeviceType, getDeviceName } from '@/lib/deviceFingerprint';

// ==================== Types ====================

export interface DeviceInfo {
    id: number;
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
    ipAddress: string;
    lastLoginAt: string;
    registeredAt: string;
    isActive: boolean;
    isCurrentDevice: boolean;
}

export interface ActiveSession {
    sessionId: number;
    sessionToken: string;
    device: DeviceInfo;
    startedAt: string;
    lastActivityAt: string;
    expiresAt: string;
    isActive: boolean;
    courseName?: string;
}

export interface LoginWithDeviceRequest {
    email: string;
    password: string;
    deviceFingerprint: string;
    deviceName: string;
    deviceType: string;
    userAgent: string;
}

export interface LoginWithDeviceResponse {
    success: boolean;
    message: string;
    data: {
        token: string;
        type: string;
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role: string;
        plan: string;
        deviceId: number;
        deviceFingerprint: string;
        sessionToken?: string;
    };
}

export interface SessionValidationResponse {
    success: boolean;
    message: string;
    data: {
        valid: boolean;
        expiresAt: string;
        remainingMinutes: number;
        message?: string;
    };
}

// ==================== Session Heartbeat Manager ====================

let heartbeatInterval: NodeJS.Timeout | null = null;
const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

function startSessionHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }

    heartbeatInterval = setInterval(async () => {
        try {
            const sessionToken = localStorage.getItem('session_token');
            const fingerprint = localStorage.getItem('device_fingerprint');

            if (!sessionToken || !fingerprint) {
                stopSessionHeartbeat();
                return;
            }

            const result = await deviceSessionService.validateSession(sessionToken, fingerprint);

            if (!result.success || !result.data.valid) {
                console.warn('Session invalid:', result.data?.message || result.message);
                // Don't auto redirect - let the course page handle it
                localStorage.removeItem('session_token');
                stopSessionHeartbeat();
            } else {
                console.log('Session validated, expires in', result.data.remainingMinutes, 'minutes');
            }
        } catch (error) {
            console.error('Session heartbeat failed:', error);
        }
    }, HEARTBEAT_INTERVAL);
}

function stopSessionHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// ==================== Device Session Service ====================

export const deviceSessionService = {
    /**
     * Login with device tracking
     * This is the preferred login method that registers the device
     */
    loginWithDevice: async (email: string, password: string): Promise<LoginWithDeviceResponse> => {
        const fingerprint = await getDeviceFingerprint();
        const deviceType = detectDeviceType();
        const deviceName = getDeviceName();

        const request: LoginWithDeviceRequest = {
            email,
            password,
            deviceFingerprint: fingerprint,
            deviceName,
            deviceType,
            userAgent: navigator.userAgent,
        };

        const response = await api.post('/auth/login-device', request);

        if (response.data.success) {
            // Store device fingerprint for future use
            localStorage.setItem('device_fingerprint', fingerprint);
            localStorage.setItem('device_id', response.data.data.deviceId.toString());
        }

        return response.data;
    },

    /**
     * Start a course session
     * Only one session can be active at a time
     */
    startCourseSession: async (): Promise<ActiveSession> => {
        const fingerprint = await getDeviceFingerprint();

        const response = await api.post('/auth/start-session', null, {
            params: { deviceFingerprint: fingerprint }
        });

        if (response.data.success) {
            const session = response.data.data;
            // Store session token
            localStorage.setItem('session_token', session.sessionToken);

            // Start heartbeat to keep session alive
            startSessionHeartbeat();

            return session;
        }

        throw new Error(response.data.message || 'Failed to start session');
    },

    /**
     * Validate current session (heartbeat)
     */
    validateSession: async (sessionToken: string, deviceFingerprint?: string): Promise<SessionValidationResponse> => {
        const fingerprint = deviceFingerprint || await getDeviceFingerprint();

        const response = await api.post('/auth/validate-session', null, {
            params: {
                sessionToken,
                deviceFingerprint: fingerprint
            }
        });

        return response.data;
    },

    /**
     * End current course session
     */
    endCourseSession: async (): Promise<void> => {
        const sessionToken = localStorage.getItem('session_token');

        if (sessionToken) {
            try {
                await api.post('/auth/end-session', null, {
                    params: { sessionToken }
                });
            } catch (error) {
                console.error('Failed to end session:', error);
            }

            localStorage.removeItem('session_token');
            stopSessionHeartbeat();
        }
    },

    /**
     * Get all registered devices for the current user
     */
    getUserDevices: async (): Promise<DeviceInfo[]> => {
        const fingerprint = await getDeviceFingerprint();

        const response = await api.get('/auth/devices', {
            params: { currentDeviceFingerprint: fingerprint }
        });

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Failed to get devices');
    },

    /**
     * Remove a device (remote logout)
     */
    removeDevice: async (deviceId: number): Promise<void> => {
        const response = await api.delete(`/auth/devices/${deviceId}`);

        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to remove device');
        }
    },

    /**
     * Logout from all devices
     */
    logoutFromAllDevices: async (): Promise<void> => {
        await api.post('/auth/logout-all');
        stopSessionHeartbeat();
        localStorage.removeItem('session_token');
    },

    /**
     * Check if there's an active session
     */
    hasActiveSession: (): boolean => {
        return !!localStorage.getItem('session_token');
    },

    /**
     * Get current session token
     */
    getSessionToken: (): string | null => {
        return localStorage.getItem('session_token');
    },

    /**
     * Get current device fingerprint
     */
    getCurrentFingerprint: async (): Promise<string> => {
        return await getDeviceFingerprint();
    },

    /**
     * Check if session is valid before accessing protected content
     */
    ensureValidSession: async (): Promise<boolean> => {
        const sessionToken = localStorage.getItem('session_token');

        if (!sessionToken) {
            // No session - need to start one
            try {
                await deviceSessionService.startCourseSession();
                return true;
            } catch (error) {
                console.error('Failed to start session:', error);
                return false;
            }
        }

        // Validate existing session
        try {
            const fingerprint = await getDeviceFingerprint();
            const result = await deviceSessionService.validateSession(sessionToken, fingerprint);

            if (result.success && result.data.valid) {
                return true;
            }

            // Session invalid - try to start a new one
            localStorage.removeItem('session_token');
            await deviceSessionService.startCourseSession();
            return true;
        } catch (error) {
            console.error('Session validation failed:', error);
            return false;
        }
    },

    /**
     * Stop the heartbeat (call on logout or when leaving course pages)
     */
    stopHeartbeat: stopSessionHeartbeat,

    /**
     * Start the heartbeat manually (if needed)
     */
    startHeartbeat: startSessionHeartbeat,
};

export default deviceSessionService;
