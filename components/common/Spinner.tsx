
import React from 'react';

interface SpinnerProps {
    large?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ large = false }) => {
    const sizeClasses = large ? 'w-12 h-12' : 'w-5 h-5';
    return (
        <div 
            className={`animate-spin rounded-full border-t-2 border-b-2 border-white ${sizeClasses}`}
            style={{ borderTopColor: 'transparent' }}
        ></div>
    );
};

export default Spinner;
