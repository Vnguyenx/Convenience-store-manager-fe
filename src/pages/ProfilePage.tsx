import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile, resetPassword } from '../services/authService';
import { getPasswordError, getConfirmPasswordError, getNewPasswordError } from '../utils/validators';
import '../styles/layout/profile.css';
import '../styles/base/base.css';

function ProfilePage() {
    const user = useAppSelector(s => s.auth.user);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // --- thông tin cá nhân ---
    const [profile, setProfile] = useState({
        fullName: user?.fullName || '',
        phone:    user?.phone    || '',
        photoURL: user?.photoURL || '',
    });
    const [profileMsg, setProfileMsg] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);

    // ⚠️ FIX: user thường được load bất đồng bộ (Firebase/Redux), nên lúc
    // component mount, "user" có thể vẫn null -> useState initializer chỉ
    // chạy 1 lần và không tự cập nhật lại. Cần đồng bộ profile state mỗi khi
    // user thay đổi (kể cả khi photoURL/fullName/phone được load trễ).
    useEffect(() => {
        if (user) {
            setProfile({
                fullName: user.fullName || '',
                phone:    user.phone    || '',
                photoURL: user.photoURL || '',
            });
        }
    }, [user]);

    // --- đổi mật khẩu ---
    const [pw, setPw] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwMsg, setPwMsg]         = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    // Submit cập nhật thông tin
    const handleProfileSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setProfileMsg('');
        if (!profile.fullName.trim()) return setProfileMsg('Vui lòng nhập họ tên');
        if (profile.phone && !/^0\d{9}$/.test(profile.phone))
            return setProfileMsg('Số điện thoại không hợp lệ');

        setProfileLoading(true);
        try {
            await updateProfile(profile);
            // Cập nhật Redux nếu cần: dispatch(updateUser(profile))
            setProfileMsg('✓ Cập nhật thành công');
        } catch (err: any) {
            setProfileMsg(err.message);
        } finally {
            setProfileLoading(false);
        }
    };

    // Submit đổi mật khẩu
    const handlePasswordSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setPwMsg('');

        // Xác thực mật khẩu cũ phía client qua Firebase Auth (reauthenticate)
        // → nếu chưa có reauthenticate, có thể bỏ qua oldPassword ở bước này
        const newPwError = getNewPasswordError(pw.oldPassword, pw.newPassword);
        if (newPwError) return setPwMsg(newPwError);

        const confirmError = getConfirmPasswordError(pw.newPassword, pw.confirmPassword);
        if (confirmError) return setPwMsg(confirmError);

        setPwLoading(true);
        try {
            await resetPassword(pw.oldPassword, pw.newPassword);
            setPwMsg('✓ Đổi mật khẩu thành công');
            setPw({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPwMsg(err.message);
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div className="profile-page">
            {/* Header + nút Back */}
            <div className="profile-page__header">
                <button
                    type="button"
                    className="profile-back-btn"
                    onClick={() => navigate(-1)}
                    aria-label="Quay lại"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none"
                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Quay lại
                </button>
                <h2>Tài khoản của tôi</h2>
                <p>Quản lý thông tin cá nhân và bảo mật tài khoản</p>
            </div>

            <div className="profile-page__body">
                {/* Card thông tin cá nhân */}
                <section className="profile-card">
                    <div className="profile-card__avatar-wrap">
                        {profile.photoURL
                            ? <img className="profile-card__avatar-img" src={profile.photoURL} alt="avatar" />
                            : <div className="profile-card__avatar-placeholder">{profile.fullName?.[0] || '?'}</div>
                        }
                        <div>
                            <div className="profile-card__name">{profile.fullName || 'Chưa cập nhật tên'}</div>
                            <div className="profile-card__role">{user?.role || 'Thành viên'}</div>
                        </div>
                    </div>

                    <div className="profile-card__title">Thông tin cá nhân</div>
                    <form className="profile-form" onSubmit={handleProfileSubmit}>
                        {profileMsg && (
                            <p className={profileMsg.startsWith('✓') ? 'profile-msg profile-msg--ok' : 'profile-msg profile-msg--err'}>
                                {profileMsg}
                            </p>
                        )}

                        <div className="profile-field">
                            <label>Họ tên</label>
                            <input value={profile.fullName}
                                   onChange={e => setProfile({ ...profile, fullName: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Số điện thoại</label>
                            <input value={profile.phone}
                                   onChange={e => setProfile({ ...profile, phone: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>URL ảnh đại diện</label>
                            <input placeholder="https://..."
                                   value={profile.photoURL}
                                   onChange={e => setProfile({ ...profile, photoURL: e.target.value })} />
                        </div>

                        <button type="submit" className="profile-btn" disabled={profileLoading}>
                            {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </form>
                </section>

                {/* Card đổi mật khẩu */}
                <section className="profile-card">
                    <div className="profile-card__title">Đổi mật khẩu</div>
                    <form className="profile-form" onSubmit={handlePasswordSubmit}>
                        {pwMsg && (
                            <p className={pwMsg.startsWith('✓') ? 'profile-msg profile-msg--ok' : 'profile-msg profile-msg--err'}>
                                {pwMsg}
                            </p>
                        )}

                        <div className="profile-field">
                            <label>Mật khẩu cũ</label>
                            <input type="password" value={pw.oldPassword} required
                                   onChange={e => setPw({ ...pw, oldPassword: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Mật khẩu mới</label>
                            <input type="password" placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
                                   value={pw.newPassword} required
                                   onChange={e => setPw({ ...pw, newPassword: e.target.value })} />
                        </div>
                        <div className="profile-field">
                            <label>Nhập lại mật khẩu mới</label>
                            <input type="password" value={pw.confirmPassword} required
                                   onChange={e => setPw({ ...pw, confirmPassword: e.target.value })} />
                        </div>

                        <button type="submit" className="profile-btn" disabled={pwLoading}>
                            {pwLoading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;