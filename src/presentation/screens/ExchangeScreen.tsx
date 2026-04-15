/**
 * ExchangeScreen — single screen that drives the entire currency exchange
 * flow. Layout (top → bottom, flush with header per CLAUDE.md rules):
 *
 *   1. Pair selector row (From chip · swap · To chip)
 *   2. Amount input
 *   3. Convert button
 *   4. Result card (output · rate line · fetched timestamp · stale badge)
 *   5. Favorite star toggle
 *   6. Recent lookups horizontal scroll (max 10)
 *   7. Favorite pairs row (max 20)
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import type {
  CurrencyCode,
  ExchangeRate,
} from '../../domain/models/Currency';
import {formatCurrencyAmount} from '../../domain/usecases/formatCurrencyAmount';
import {
  addFavorite,
  addToHistory,
  amountChanged,
  convert,
  fromChanged,
  loadCurrencies,
  loadFavorites,
  loadHistory,
  pairRestored,
  pairSwapped,
  removeFavorite,
  selectCurrencies,
  selectCurrentAmount,
  selectCurrentFavoriteId,
  selectExchangeState,
  selectFavorites,
  selectHistory,
  selectIsFavorited,
  selectSelectedPair,
  toChanged,
  useAppDispatch,
  useAppSelector,
} from '../../store';
import {logger} from '../../utils/logger';
import {PlatformIcon} from '../components/common/PlatformIcon';
import {ThrottledPressable} from '../components/common/ThrottledPressable';
import {useTheme, type AppTheme} from '../theme/ThemeProvider';

import {
  CurrencyPickerSheet,
  type CurrencyPickerSheetRef,
} from './CurrencyPickerSheet';

const parseAmountText = (text: string): number => {
  if (text.length === 0) {
    return 0;
  }
  const normalised = text.replace(',', '.');
  const n = Number(normalised);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const formatRate = (rate: number): string => {
  // Up to 4 decimals, trim trailing zeros, keep at least 2 decimals.
  const rounded = Math.round(rate * 10000) / 10000;
  const str = rounded.toFixed(4);
  const trimmed = str.replace(/0+$/, '').replace(/\.$/, '');
  if (!trimmed.includes('.')) {
    return `${trimmed}.00`;
  }
  const [int, frac] = trimmed.split('.');
  if (frac.length < 2) {
    return `${int}.${frac.padEnd(2, '0')}`;
  }
  return trimmed;
};

const formatFetchedTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
};

const minutesSince = (iso: string, now: number = Date.now()): number => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) {
    return 0;
  }
  return Math.max(0, Math.floor((now - t) / 60000));
};

export const ExchangeScreen: React.FC = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const dispatch = useAppDispatch();

  const currencies = useAppSelector(selectCurrencies);
  const {from, to} = useAppSelector(selectSelectedPair);
  const amount = useAppSelector(selectCurrentAmount);
  const exchangeState = useAppSelector(selectExchangeState);
  const history = useAppSelector(selectHistory);
  const favorites = useAppSelector(selectFavorites);
  const isFavorited = useAppSelector(selectIsFavorited);
  const currentFavoriteId = useAppSelector(selectCurrentFavoriteId);

  const [amountText, setAmountText] = useState<string>('1');
  const pickerRef = useRef<CurrencyPickerSheetRef>(null);

  useEffect(() => {
    dispatch(loadCurrencies())
      .unwrap()
      .catch(err => logger.warn('loadCurrencies failed', err));
    dispatch(loadHistory());
    dispatch(loadFavorites());
  }, [dispatch]);

  const handleAmountChange = (text: string): void => {
    setAmountText(text);
    dispatch(amountChanged(parseAmountText(text)));
  };

  const openFromPicker = (): void => {
    pickerRef.current?.open((code: CurrencyCode) => {
      dispatch(fromChanged(code));
    });
  };

  const openToPicker = (): void => {
    pickerRef.current?.open((code: CurrencyCode) => {
      dispatch(toChanged(code));
    });
  };

  const handleSwap = (): void => {
    dispatch(pairSwapped());
  };

  const handleConvert = async (): Promise<void> => {
    try {
      const action = await dispatch(convert({from, to, amount})).unwrap();
      dispatch(
        addToHistory({
          from,
          to,
          amount,
          result: action.output,
        }),
      );
    } catch (err) {
      logger.warn('convert failed', err);
    }
  };

  const handleFavoriteToggle = (): void => {
    if (isFavorited && currentFavoriteId != null) {
      dispatch(removeFavorite(currentFavoriteId));
    } else {
      dispatch(addFavorite({from, to}));
    }
  };

  const handleRestoreRecent = (entry: {
    from: CurrencyCode;
    to: CurrencyCode;
    amount: number;
  }): void => {
    dispatch(
      pairRestored({
        from: entry.from,
        to: entry.to,
        amount: entry.amount,
      }),
    );
    setAmountText(entry.amount.toString());
  };

  const handleRestoreFavorite = (pair: {
    from: CurrencyCode;
    to: CurrencyCode;
  }): void => {
    dispatch(pairRestored({from: pair.from, to: pair.to}));
  };

  const ready = exchangeState.kind === 'ready' ? exchangeState.result : null;
  const loading = exchangeState.kind === 'loading';
  const errored = exchangeState.kind === 'error' ? exchangeState.message : null;

  const resultRate: ExchangeRate | null = ready?.rate ?? null;

  return (
    <View style={styles.root} testID="screen.exchange">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        {/* 1. Pair selector row */}
        <View style={styles.pairRow}>
          <ThrottledPressable
            testID="exchange.pair.from"
            accessibilityRole="button"
            accessibilityLabel={t('exchange.pickFrom')}
            style={({pressed}) => [
              styles.pairChip,
              pressed ? styles.pairChipPressed : null,
            ]}
            onPress={openFromPicker}>
            <Text style={styles.pairChipLabel}>{t('exchange.fromLabel')}</Text>
            <Text style={styles.pairChipCode}>{from}</Text>
          </ThrottledPressable>

          <ThrottledPressable
            testID="exchange.swap"
            accessibilityRole="button"
            accessibilityLabel={t('exchange.swap')}
            style={({pressed}) => [
              styles.swapButton,
              pressed ? styles.swapButtonPressed : null,
            ]}
            onPress={handleSwap}>
            <PlatformIcon
              name="swap-horiz"
              Component={MaterialIcon}
              size={theme.componentSize.iconBase}
              color={theme.colors.onPrimary}
            />
          </ThrottledPressable>

          <ThrottledPressable
            testID="exchange.pair.to"
            accessibilityRole="button"
            accessibilityLabel={t('exchange.pickTo')}
            style={({pressed}) => [
              styles.pairChip,
              pressed ? styles.pairChipPressed : null,
            ]}
            onPress={openToPicker}>
            <Text style={styles.pairChipLabel}>{t('exchange.toLabel')}</Text>
            <Text style={styles.pairChipCode}>{to}</Text>
          </ThrottledPressable>
        </View>

        {/* 2. Amount input */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionLabel}>{t('exchange.amountLabel')}</Text>
          <TextInput
            testID="exchange.amount"
            accessibilityLabel={t('exchange.amountAccessibility')}
            style={styles.amountInput}
            value={amountText}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder={t('exchange.amountPlaceholder')}
            placeholderTextColor={theme.colors.textTertiary}
          />
        </View>

        {/* 3. Convert button */}
        <View style={styles.convertSection}>
          <ThrottledPressable
            testID="exchange.convertButton"
            accessibilityRole="button"
            disabled={loading || amount <= 0}
            style={({pressed}) => [
              styles.convertButton,
              pressed ? styles.convertButtonPressed : null,
              loading || amount <= 0 ? styles.convertButtonDisabled : null,
            ]}
            onPress={handleConvert}>
            <Text style={styles.convertButtonText}>
              {loading ? t('exchange.loading') : t('exchange.convert')}
            </Text>
          </ThrottledPressable>
        </View>

        {/* 4. Result card */}
        {ready != null && resultRate != null ? (
          <View style={styles.resultCard} testID="exchange.result">
            <Text style={styles.resultLabel}>{t('exchange.resultTitle')}</Text>
            <Text style={styles.resultOutput}
              accessibilityLabel={`${ready.output} ${resultRate.to}`}>
              {formatCurrencyAmount(ready.output, resultRate.to)}
            </Text>
            <Text style={styles.resultRateLine}>
              {t('exchange.rateLine', {
                from: resultRate.from,
                to: resultRate.to,
                rate: formatRate(resultRate.rate),
              })}
            </Text>
            <Text style={styles.resultFetched}>
              {t('exchange.fetchedAt', {
                time: formatFetchedTime(resultRate.fetchedAt),
              })}
            </Text>
            {resultRate.isStale ? (
              <View
                testID="exchange.stale"
                accessibilityLabel={t('exchange.stale', {
                  minutes: minutesSince(resultRate.fetchedAt),
                })}
                style={styles.staleBadge}>
                <PlatformIcon
                  name="warning"
                  Component={MaterialIcon}
                  size={theme.componentSize.iconSm}
                  color={theme.colors.warning}
                />
                <Text style={styles.staleBadgeText}>
                  {t('exchange.staleBadge')}
                </Text>
              </View>
            ) : null}

            {/* 5. Favorite star */}
            <ThrottledPressable
              testID="exchange.favoriteToggle"
              accessibilityRole="button"
              accessibilityState={{checked: isFavorited}}
              accessibilityLabel={
                isFavorited
                  ? t('exchange.favoriteRemove')
                  : t('exchange.favoriteAdd')
              }
              style={({pressed}) => [
                styles.favoriteButton,
                pressed ? styles.favoriteButtonPressed : null,
              ]}
              onPress={handleFavoriteToggle}>
              <PlatformIcon
                name={isFavorited ? 'star' : 'star-border'}
                Component={MaterialIcon}
                size={theme.componentSize.iconBase}
                color={
                  isFavorited ? theme.colors.secondary : theme.colors.textTertiary
                }
              />
              <Text style={styles.favoriteButtonText}>
                {isFavorited
                  ? t('exchange.favoriteRemove')
                  : t('exchange.favoriteAdd')}
              </Text>
            </ThrottledPressable>
          </View>
        ) : null}

        {errored != null ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{t('exchange.errorNetwork')}</Text>
          </View>
        ) : null}

        {/* 6. Recent lookups */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionLabel}>{t('exchange.recentTitle')}</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>{t('exchange.recentEmpty')}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScrollContent}>
              {history.map(entry => (
                <ThrottledPressable
                  key={entry.id}
                  testID={`exchange.recent.${entry.id}`}
                  style={({pressed}) => [
                    styles.recentChip,
                    pressed ? styles.recentChipPressed : null,
                  ]}
                  onPress={() => handleRestoreRecent(entry)}>
                  <Text style={styles.recentChipText}>
                    {`${entry.from} → ${entry.to}`}
                  </Text>
                  <Text style={styles.recentChipSub}>
                    {formatCurrencyAmount(entry.amount, entry.from)}
                  </Text>
                </ThrottledPressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 7. Favorite pairs */}
        <View style={styles.favoritesSection}>
          <Text style={styles.sectionLabel}>
            {t('exchange.favoritesTitle')}
          </Text>
          {favorites.length === 0 ? (
            <Text style={styles.emptyText}>{t('exchange.favoritesEmpty')}</Text>
          ) : (
            <View style={styles.favoritesWrap}>
              {favorites.map(pair => (
                <ThrottledPressable
                  key={pair.id}
                  testID={`exchange.favorite.${pair.id}`}
                  style={({pressed}) => [
                    styles.favoriteChip,
                    pressed ? styles.favoriteChipPressed : null,
                  ]}
                  onPress={() => handleRestoreFavorite(pair)}>
                  <Text style={styles.favoriteChipText}>
                    {`${pair.from} → ${pair.to}`}
                  </Text>
                </ThrottledPressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <CurrencyPickerSheet ref={pickerRef} currencies={currencies} />
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.massive,
    },
    // 1. Pair row
    pairRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pairChip: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.base,
      paddingVertical: theme.spacing.base,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.xs,
    },
    pairChipPressed: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    pairChipLabel: {
      ...theme.typography.labelMedium,
      color: theme.colors.textTertiary,
    },
    pairChipCode: {
      ...theme.typography.headlineSmall,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.xxs,
    },
    swapButton: {
      width: theme.componentSize.stepperButtonSize,
      height: theme.componentSize.stepperButtonSize,
      borderRadius: theme.borderRadius.pill,
      backgroundColor: theme.colors.primary,
      marginHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    swapButtonPressed: {
      backgroundColor: theme.colors.primaryDark,
    },

    // 2. Amount
    amountSection: {
      marginTop: theme.spacing.xl,
    },
    sectionLabel: {
      ...theme.typography.labelLarge,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.sm,
    },
    amountInput: {
      ...theme.typography.displayLarge,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.base,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.base,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    // 3. Convert button
    convertSection: {
      marginTop: theme.spacing.lg,
    },
    convertButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.base,
      height: theme.componentSize.buttonHeightLarge,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    convertButtonPressed: {
      backgroundColor: theme.colors.primaryDark,
    },
    convertButtonDisabled: {
      backgroundColor: theme.colors.disabled,
    },
    convertButtonText: {
      ...theme.typography.titleLarge,
      color: theme.colors.onPrimary,
    },

    // 4. Result card
    resultCard: {
      marginTop: theme.spacing.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      ...theme.shadows.md,
    },
    resultLabel: {
      ...theme.typography.labelLarge,
      color: theme.colors.textTertiary,
    },
    resultOutput: {
      ...theme.typography.tipDisplay,
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
    },
    resultRateLine: {
      ...theme.typography.bodyLarge,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
    },
    resultFetched: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    staleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.secondaryContainer,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    staleBadgeText: {
      ...theme.typography.labelMedium,
      color: theme.colors.onSecondaryContainer,
      marginLeft: theme.spacing.xs,
    },
    favoriteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
    },
    favoriteButtonPressed: {
      opacity: 0.6,
    },
    favoriteButtonText: {
      ...theme.typography.labelLarge,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.sm,
    },

    errorCard: {
      marginTop: theme.spacing.base,
      padding: theme.spacing.base,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.base,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.error,
    },
    errorText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.error,
    },

    // 6. Recent
    recentSection: {
      marginTop: theme.spacing.xxl,
    },
    recentScrollContent: {
      paddingRight: theme.spacing.xl,
    },
    recentChip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.base,
      borderWidth: 1,
      borderColor: theme.colors.borderLight,
      marginRight: theme.spacing.sm,
    },
    recentChipPressed: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    recentChipText: {
      ...theme.typography.titleSmall,
      color: theme.colors.textPrimary,
    },
    recentChipSub: {
      ...theme.typography.bodySmall,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xxs,
    },
    emptyText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.textTertiary,
    },

    // 7. Favorites
    favoritesSection: {
      marginTop: theme.spacing.xxl,
    },
    favoritesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    favoriteChip: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.base,
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: theme.borderRadius.pill,
      marginRight: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    favoriteChipPressed: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    favoriteChipText: {
      ...theme.typography.labelLarge,
      color: theme.colors.onPrimaryContainer,
    },
  });
