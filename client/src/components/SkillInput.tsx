import React, { useState} from 'react';
import type {KeyboardEvent} from 'react';
import { useTheme } from '../Contexts/ThemeContext';
import { X } from 'lucide-react';

interface SkillInputProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
  placeholder?: string;
}

export const SkillInput: React.FC<SkillInputProps> = ({
  skills,
  onSkillsChange,
  placeholder = 'Add skills...'
}) => {
  const [inputValue, setInputValue] = useState('');
  const { theme } = useTheme();
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' && inputValue.trim()) {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (newSkill && !skills.includes(newSkill)) {
        onSkillsChange([...skills, newSkill]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      // Remove last skill when backspace is pressed and input is empty
      onSkillsChange(skills.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
      {skills.map((skill, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 px-3 py-1 ${theme === 'dark' ? 'bg-purple-100' : 'bg-purple-100'} text-purple-700 rounded-full`}
        >
          <span className="text-sm font-medium">{skill}</span>
          <button
            onClick={() => removeSkill(skill)}
            className={`text-purple-500 hover:text-purple-700 focus:outline-none`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={skills.length === 0 ? placeholder : ''}
        className={`flex-1 min-w-[120px] outline-none text-sm ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}
      />
    </div>
  );
}; 