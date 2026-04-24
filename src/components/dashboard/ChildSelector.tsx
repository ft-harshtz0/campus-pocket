import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import { ChevronDown, User } from 'lucide-react-native';
import { Avatar } from '../ui/Avatar';
import { Typography } from '../../constants/typography';
import { useTheme } from '../../hooks/useTheme';
import { ChildInfo } from '../../types/database';

interface ChildSelectorProps {
  children: ChildInfo[];
  selected: ChildInfo | null;
  onSelect: (child: ChildInfo) => void;
}

export function ChildSelector({ children, selected, onSelect }: ChildSelectorProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  if (children.length <= 1) {
    return selected ? (
      <View style={styles.singleChild}>
        <Avatar name={selected.full_name} size={32} />
        <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 8 }]}>
          {selected.full_name}
        </Text>
      </View>
    ) : null;
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.selector, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        {selected && <Avatar name={selected.full_name} size={28} />}
        <Text style={[Typography.bodyMedium, { color: theme.text, marginLeft: 8, flex: 1 }]}>
          {selected?.full_name || 'Select child'}
        </Text>
        <ChevronDown size={18} color={theme.textMuted} />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View style={[styles.dropdown, { backgroundColor: theme.surface }]}>
            <Text style={[Typography.heading, { color: theme.text, marginBottom: 12 }]}>
              Select Child
            </Text>
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => {
                  onSelect(child);
                  setVisible(false);
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected?.id === child.id
                      ? (theme.isDark ? '#312E81' : '#EEF2FF')
                      : 'transparent',
                    borderColor: theme.borderLight,
                  },
                ]}
              >
                <Avatar name={child.full_name} size={36} />
                <Text
                  style={[
                    Typography.bodyMedium,
                    {
                      color: selected?.id === child.id ? theme.primary : theme.text,
                      marginLeft: 12,
                    },
                  ]}
                >
                  {child.full_name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  singleChild: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
  },
  dropdown: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    borderBottomWidth: 0.5,
  },
});
