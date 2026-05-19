import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/theme';
import Card from '../../src/components/Card';
import Badge from '../../src/components/Badge';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import EmptyState from '../../src/components/EmptyState';
import ErrorState from '../../src/components/ErrorState';
import { api, ApiError } from '../../src/services/api';

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface Category {
  id: number;
  label: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  points_awarded: number;
  capacity: number;
  registered_count: number;
  category: string;
}

interface EventsResponse {
  data: EventItem[];
  total: number;
  page: number;
  total_pages: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 0, label: 'All' },
  { id: 1, label: 'Environment' },
  { id: 2, label: 'Elderly' },
  { id: 3, label: 'Youth' },
  { id: 4, label: 'Animals' },
  { id: 5, label: 'Community' },
  { id: 6, label: 'Health' },
];

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default function EventsScreen() {
  const router = useRouter();
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search or category changes
  const prevCategoryRef = useRef(selectedCategory);
  const prevSearchRef = useRef(debouncedSearch);

  useEffect(() => {
    if (prevCategoryRef.current !== selectedCategory || prevSearchRef.current !== debouncedSearch) {
      prevCategoryRef.current = selectedCategory;
      prevSearchRef.current = debouncedSearch;
      setPage(1);
      setEvents([]);
    }
  }, [selectedCategory, debouncedSearch]);

  // Fetch categories on mount
  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      try {
        const res = await api.get<{ data: Category[] }>('/api/events/categories');
        if (!cancelled && res.data && res.data.length > 0) {
          setCategories([{ id: 0, label: 'All' }, ...res.data]);
        }
      } catch {
        // Categories are optional; use defaults if fetch fails
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch events
  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      const isFirstPage = page === 1;

      if (isFirstPage) {
        setLoadingState('loading');
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        if (selectedCategory > 0) {
          params.set('category', String(selectedCategory));
        }
        if (debouncedSearch.trim()) {
          params.set('search', debouncedSearch.trim());
        }
        params.set('page', String(page));
        params.set('limit', '20');

        const res = await api.get<EventsResponse>(`/api/events?${params.toString()}`);

        if (!cancelled) {
          if (isFirstPage) {
            setEvents(res.data);
          } else {
            setEvents((prev) => [...prev, ...res.data]);
          }
          setTotal(res.total);
          setTotalPages(res.total_pages);
          setLoadingState('success');
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : 'Failed to load events.';
          setError(message);
          if (isFirstPage && events.length === 0) {
            setLoadingState('error');
          } else {
            // If we have existing events, keep showing them
            setLoadingState('success');
          }
        }
      } finally {
        if (!cancelled) {
          setRefreshing(false);
          setIsLoadingMore(false);
        }
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory, debouncedSearch]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
  }, []);

  // Handle category chip press
  const handleCategoryPress = useCallback((catId: number) => {
    if (catId !== selectedCategory) {
      setSelectedCategory(catId);
    }
  }, [selectedCategory]);

  // Handle search text change
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Load more (infinite scroll)
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore, page, totalPages]);

  // Handle search submit
  const handleSearchSubmit = useCallback(() => {
    setDebouncedSearch(searchQuery);
  }, [searchQuery]);

  // Render event card
  const renderEventItem = useCallback(
    ({ item }: { item: EventItem }) => {
      const filledPercent = Math.min(
        (item.registered_count / item.capacity) * 100,
        100,
      );

      return (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/events/${item.id}`)}
          style={styles.eventCardContainer}
        >
          <Card style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDateTime}>
              {formatDate(item.date)}
              {item.time ? ` · ${item.time}` : ''}
            </Text>
            <View style={styles.eventLocationRow}>
              <Text style={styles.eventLocationIcon}>📍</Text>
              <Text style={styles.eventLocation} numberOfLines={1}>
                {item.location}
              </Text>
            </View>

            {/* Capacity bar */}
            <View style={styles.capacityContainer}>
              <View style={styles.capacityTrack}>
                <View
                  style={[
                    styles.capacityFill,
                    { width: `${filledPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.capacityText}>
                {item.registered_count}/{item.capacity} spots filled
              </Text>
            </View>

            {/* Points badge */}
            <View style={styles.eventCardFooter}>
              <View style={styles.pointsBadge}>
                <Text style={styles.pointsBadgeText}>
                  {item.points_awarded} pts
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      );
    },
    [router],
  );

  const keyExtractor = useCallback(
    (item: EventItem) => String(item.id),
    [],
  );

  // Loading state (initial only)
  if (loadingState === 'loading' && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Events</Text>
        </View>
        <LoadingSpinner fullScreen />
      </SafeAreaView>
    );
  }

  // Error state (no data at all)
  if (loadingState === 'error' && events.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Events</Text>
        </View>
        <ErrorState
          message={error || 'Something went wrong'}
          onRetry={() => {
            setPage(1);
            setEvents([]);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Events</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor={colors.text.tertiary}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat) => {
              const isActive = cat.id === selectedCategory;
              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    isActive ? styles.chipActive : styles.chipInactive,
                  ]}
                  onPress={() => handleCategoryPress(cat.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive ? styles.chipTextActive : styles.chipTextInactive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Events List */}
        <FlatList
          data={events}
          keyExtractor={keyExtractor}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent.green}
              colors={[colors.accent.green]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            loadingState === 'success' ? (
              <EmptyState
                icon="🔍"
                title="No events found"
                message={
                  debouncedSearch
                    ? `No events matching "${debouncedSearch}"`
                    : 'No events available at this time. Check back later!'
                }
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                  setSelectedCategory(0);
                }}
              />
            ) : null
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={colors.accent.green} />
                <Text style={styles.footerLoaderText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.page,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.largeTitle,
    color: colors.text.primary,
  },
  // Search Bar
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    borderRadius: 10,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    height: '100%',
    padding: 0,
  },
  // Category Chips
  categoriesContainer: {
    marginBottom: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginRight: 0,
  },
  chipActive: {
    backgroundColor: colors.accent.green,
  },
  chipInactive: {
    backgroundColor: colors.bg.subtle,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.inverse,
  },
  chipTextInactive: {
    color: colors.text.secondary,
  },
  // Event List
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  eventCardContainer: {
    marginBottom: spacing.md,
  },
  eventCard: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  eventDateTime: {
    fontSize: 15,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  eventLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  eventLocationIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  eventLocation: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  // Capacity Bar
  capacityContainer: {
    marginBottom: spacing.md,
  },
  capacityTrack: {
    height: 6,
    backgroundColor: colors.bg.subtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  capacityFill: {
    height: '100%',
    backgroundColor: colors.accent.green,
    borderRadius: 3,
  },
  capacityText: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  // Points Badge
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsBadge: {
    backgroundColor: '#E8F8E8',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  pointsBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.green,
  },
  // Footer Loader
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerLoaderText: {
    ...typography.subhead,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
});
