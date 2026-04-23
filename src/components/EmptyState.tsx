// ─── Empty State Component ─────────────────────────────────────────────────────

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Font, Spacing, Radius } from '../theme';

interface Props {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

const ViewComp = View as any;
const TextComp = Text as any;
const PressableComp = Pressable as any;

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <ViewComp style={styles.container}>
      <TextComp style={styles.icon}>{icon}</TextComp>
      <TextComp style={styles.title}>{title}</TextComp>
      <TextComp style={styles.message}>{message}</TextComp>
      {actionLabel && onAction && (
        <PressableComp 
          style={({ pressed }: any) => [styles.button, { opacity: pressed ? 0.8 : 1 }]} 
          onPress={onAction}
        >
          <TextComp style={styles.buttonText}>{actionLabel}</TextComp>
        </PressableComp>
      )}
    </ViewComp>
  ) as any;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.xxxl,
    paddingVertical: Spacing.huge,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Font.size.lg,
    ...Font.bold,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Font.size.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Font.size.sm,
    ...Font.semibold,
  },
});
