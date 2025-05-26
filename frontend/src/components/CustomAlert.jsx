import React, { useEffect } from 'react';

const CustomAlert = ({ message, type = 'warning', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`alert-message alert-${type}`}>
      {message}
    </div>
  );
};

export default CustomAlert;