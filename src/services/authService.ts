import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types/models';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchCurrentUser = async (idToken: string): Promise<User> => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) throw new Error('Không lấy được thông tin người dùng');
    const data = await res.json();
    return data.user;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    return fetchCurrentUser(idToken);
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const registerUser = async (data: {
    email: string; password: string; fullName: string; phone?: string;
}) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Đăng ký thất bại');
    }
    return loginUser(data.email, data.password);
};