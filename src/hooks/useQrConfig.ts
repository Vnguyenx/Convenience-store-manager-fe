// src/hooks/useQrConfig.ts
import { useState } from 'react';
import { getAuth } from 'firebase/auth';

export interface QrGenerateResult {
    qrUrl: string;
    bankId: string;
    accountNo: string;
    accountName: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export function useQrConfig() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Gọi BE để lấy link QR đã build sẵn cho 1 đơn hàng cụ thể
     */
    const generateQr = async (orderCode: string, amount: number): Promise<QrGenerateResult | null> => {
        setLoading(true);
        setError(null);
        try {
            const currentUser = getAuth().currentUser;
            if (!currentUser) {
                throw new Error('Chưa đăng nhập');
            }
            const token = await currentUser.getIdToken();

            const res = await fetch(`${API_BASE_URL}/qr-config/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ orderCode, amount }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || 'Không thể tạo mã QR');
            }

            return json.data as QrGenerateResult;
        } catch (err: any) {
            setError(err.message || 'Không thể tạo mã QR');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { generateQr, loading, error };
}