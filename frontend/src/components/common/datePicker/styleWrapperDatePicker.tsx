import React, { ReactNode } from 'react';
// import '@/styles/DatePicker.css'; // Moving this import to `_app.tsx` file

const StyleWrapperDatePicker = ({children} : {children: ReactNode}) => {
  return (
    <div className="style-wrapper-datepicker">
      {children}
    </div>
  );
};


export default StyleWrapperDatePicker;