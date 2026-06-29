// src/components/staff/shift/ShiftNote.tsx
import React from 'react';
import { NOTE_MAX_LENGTH } from '../../../types/myShift';

interface Props {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    disabled?: boolean;
}

const ShiftNote: React.FC<Props> = ({ value, onChange, disabled }) => {
    return (
        <div className="shift-note">
      <textarea
          placeholder="Ghi chú (tối đa 200 ký tự)"
          value={value}
          onChange={onChange}
          maxLength={NOTE_MAX_LENGTH}
          rows={2}
          disabled={disabled}
      />
            <div className="shift-note__count">
                {value.length}/{NOTE_MAX_LENGTH}
            </div>
        </div>
    );
};

export default ShiftNote;