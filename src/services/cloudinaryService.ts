// Cloudinary upload service for payment receipts
const CLOUDINARY_CLOUD_NAME = 'dwjdcgajl';
const CLOUDINARY_UPLOAD_PRESET = 'bclt_payments'; // unsigned upload preset

export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
}

/**
 * Upload an image to Cloudinary
 * @param file - The image file to upload
 * @returns The Cloudinary response with the secure URL
 */
export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'payment_receipts');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error('Échec de l\'upload de l\'image');
    }

    return response.json();
};
