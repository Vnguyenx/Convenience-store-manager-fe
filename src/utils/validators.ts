export const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password: string): boolean =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/.test(password);

export const getPasswordError = (password: string): string =>
    isValidPassword(password)
        ? ''
        : 'Mật khẩu phải tối thiểu 8 ký tự, gồm cả chữ và số, không chứa ký tự đặc biệt';