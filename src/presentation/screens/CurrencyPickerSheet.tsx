/**
 * CurrencyPickerSheet — bottom-sheet modal with search + FlatList of
 * currencies. Returns the picked code via callback.
 */

import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {useTranslation} from 'react-i18next';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {CurrencyCode, CurrencyInfo} from '../../domain/models/Currency';
import {PlatformIcon} from '../components/common/PlatformIcon';
import {ThrottledPressable} from '../components/common/ThrottledPressable';
import {useTheme, type AppTheme} from '../theme/ThemeProvider';

export interface CurrencyPickerSheetRef {
  open: (onSelect: (code: CurrencyCode) => void) => void;
  close: () => void;
}

export interface CurrencyPickerSheetProps {
  readonly currencies: ReadonlyArray<CurrencyInfo>;
}

const SNAP_POINTS: string[] = ['70%'];

export const CurrencyPickerSheet = forwardRef<
  CurrencyPickerSheetRef,
  CurrencyPickerSheetProps
>(({currencies}, ref) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const sheetRef = useRef<BottomSheet>(null);
  const [query, setQuery] = useState<string>('');
  const [onSelect, setOnSelect] = useState<
    ((code: CurrencyCode) => void) | null
  >(null);

  useImperativeHandle(
    ref,
    () => ({
      open: cb => {
        setOnSelect(() => cb);
        setQuery('');
        sheetRef.current?.expand();
      },
      close: () => {
        sheetRef.current?.close();
      },
    }),
    [],
  );

  const trimmed = query.trim().toLowerCase();
  const filtered = trimmed.length === 0
    ? currencies
    : currencies.filter(
        c =>
          c.code.toLowerCase().includes(trimmed) ||
          c.name.toLowerCase().includes(trimmed),
      );

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );

  const handlePick = (code: CurrencyCode): void => {
    if (onSelect != null) {
      onSelect(code);
    }
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('picker.title')}</Text>
      </View>
      <View style={styles.searchRow}>
        <PlatformIcon
          name="search"
          Component={MaterialIcon}
          size={theme.componentSize.iconMd}
          color={theme.colors.textTertiary}
        />
        <TextInput
          testID="picker.search"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={t('picker.searchPlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
          autoCorrect={false}
          autoCapitalize="characters"
        />
      </View>
      <BottomSheetFlatList
        data={filtered}
        keyExtractor={item => item.code}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('picker.empty')}</Text>
          </View>
        }
        renderItem={({item}) => (
          <ThrottledPressable
            testID={`picker.item.${item.code}`}
            style={({pressed}) => [
              styles.row,
              pressed ? styles.rowPressed : null,
            ]}
            onPress={() => handlePick(item.code)}>
            <Text style={styles.rowCode}>{item.code}</Text>
            <Text style={styles.rowName} numberOfLines={1}>
              {item.name}
            </Text>
          </ThrottledPressable>
        )}
      />
    </BottomSheet>
  );
});

CurrencyPickerSheet.displayName = 'CurrencyPickerSheet';

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    sheetBackground: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
    },
    handleIndicator: {
      backgroundColor: theme.colors.outlineVariant,
      width: 40,
      height: 4,
    },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
    },
    title: {
      ...theme.typography.titleLarge,
      color: theme.colors.textPrimary,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.base,
      height: theme.componentSize.inputHeight,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
    },
    listContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    rowPressed: {
      backgroundColor: theme.colors.pressed,
    },
    rowCode: {
      ...theme.typography.titleMedium,
      color: theme.colors.primary,
      width: 56,
    },
    rowName: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    emptyWrap: {
      paddingVertical: theme.spacing.xxl,
      alignItems: 'center',
    },
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
    },
  });
