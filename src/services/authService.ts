import { signInWithEmailAndPassword, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { User } from '../types/models';

const API_URL = process.env.REACT_APP_API_URL;

const getToken = async (): Promise<string> => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Chưa đăng nhập');
    return currentUser.getIdToken();
};

export const fetchCurrentUser = async (idToken: string): Promise<User> => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!res.ok) throw new Error('Không lấy được thông tin người dùng');
    return res.json();
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

// Cập nhật thông tin cá nhân (gọi backend, backend tự update Firebase Auth + Firestore)
export const updateProfile = async (data: {
    fullName?: string; phone?: string; photoURL?: string;
}): Promise<void> => {
    const token = await getToken();
    const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Cập nhật thất bại');
    }
};

// Đổi mật khẩu: reauthenticate bằng Firebase Client SDK trước, rồi gọi backend set mật khẩu mới
export const resetPassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) throw new Error('Chưa đăng nhập');

    // Xác thực mật khẩu cũ với Firebase trực tiếp
    const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
    await reauthenticateWithCredential(currentUser, credential);

    // Set mật khẩu mới qua Firebase Client SDK (không cần gọi backend cho trường hợp self-reset)
    await updatePassword(currentUser, newPassword);
};