import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { colors, layout } from '../theme';
import { LucideIcon } from 'lucide-react-native';

interface InputFieldProps extends TextInputProps {
  icon?: LucideIcon;
  isPassword?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({ icon: Icon, isPassword, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused]}>
      {Icon && <Icon size={20} color={isFocused ? colors.primary : colors.textMuted} style={styles.icon} />}
      
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        secureTextEntry={isPassword && !showPassword}
        {...props}
      />
      
      {/* If it's a password, we could add an eye icon here if needed. 
          For now, just simple text entry logic. If we want the eye icon from lucide, 
          we need to import Eye/EyeOff. Since we aren't passing it directly, we'll keep it simple 
          or user can provide rightIcon. */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.borderRadius,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
  },
  containerFocused: {
    borderColor: colors.primary,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
});
