import React from 'react';
import '../../styles/common/Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
                                           variant = 'primary',
                                           size = 'md',
                                           fullWidth = false,
                                           className = '',
                                           children,
                                           ...props
                                       }) => {
    const variantClass = `btn-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';
    const widthClass = fullWidth ? 'btn-full' : '';

    return (
        <button
            type="button"  // default "button" để tránh submit form và reload trang
            className={`btn ${variantClass} ${sizeClass} ${widthClass} ${className}`}
            {...props}     // type có thể bị override bởi caller nếu cần type="submit"
        >
            {children}
        </button>
    );
};

export default Button;