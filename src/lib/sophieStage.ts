/** Shared presentation constants for the tutor avatar screen. */
export const AVATAR_ENABLED = import.meta.env.VITE_SOPHIE_AVATAR === 'true';
/** VITE_TUTOR_PERSONA=anas (with backend TUTOR_PERSONA=anas and a male voice) names the tutor Professeur Anas;
 * the avatar implies it. Otherwise the tutor is Sophie. */
export const TUTOR_NAME = AVATAR_ENABLED || import.meta.env.VITE_TUTOR_PERSONA === 'anas' ? 'Professeur Anas' : 'Sophie';
export const AVATAR_CAPTION = 'Tuteur IA inspiré du professeur Anas';
