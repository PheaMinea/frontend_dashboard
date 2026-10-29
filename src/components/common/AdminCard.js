import React from 'react';

const AdminCard = ({ children, className = '' }) => {
  return (
    <section className={`admin-card ${className}`}>
      {children}
    </section>
  );
};

export default AdminCard;
