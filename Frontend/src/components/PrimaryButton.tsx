import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, layout } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'outline';
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ title, onPress, disabled = false, variant = 'solid', style }) => {
  const isSolid = variant === 'solid';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isSolid ? styles.solidButton : styles.outlineButton,
        style
      ]} 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.text, 
        isSolid ? styles.solidText : styles.outlineText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  solidButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  text: {
    ...typography.button,
  },
  solidText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
});
