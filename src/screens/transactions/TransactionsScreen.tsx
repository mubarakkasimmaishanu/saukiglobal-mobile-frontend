// src/screens/transactions/TransactionsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, RefreshControl, ViewStyle } from 'react-native';
import { getTransactions, TransactionItem } from '../../api/services';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';
import Skeleton from '../../components/common/Skeleton';
import { Ionicons } from '@expo/vector-icons';

export const TransactionsScreen: React.FC = () => {
  const [txs, setTxs] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  
  // Filters state
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const fetchTxs = async () => {
    try {
      const payload: any = { limit: 100, offset: 0 };
      if (selectedType) payload.type = selectedType;
      if (selectedStatus) payload.status = selectedStatus;
      
      const res = await getTransactions(payload);
      if (res.status && Array.isArray(res.data)) {
        setTxs(res.data);
      }
    } catch (e) {
      console.error('Failed to load transactions ledger', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTxs();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTxs();
  }, [selectedType, selectedStatus]);

  // Search local filtering
  const filteredTxs = txs.filter((tx) => {
    const term = search.toLowerCase();
    return (
      tx.id.toLowerCase().includes(term) ||
      tx.details.toLowerCase().includes(term) ||
      tx.type.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string): string => {
    const s = status.toLowerCase();
    if (s === 'success' || s === 'successful') return COLORS.primary;
    if (s === 'pending') return COLORS.warning;
    return COLORS.error;
  };

  const types = [
    { label: 'All', value: null },
    { label: 'Airtime', value: 'airtime' },
    { label: 'Data', value: 'data' },
    { label: 'Bills', value: 'bills' },
    { label: 'Exam', value: 'exam' },
    { label: 'Kirani', value: 'kirani' },
    { label: 'Smile', value: 'smile' },
  ];

  const statuses = [
    { label: 'All', value: null },
    { label: 'Success', value: 'success' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <View style={tw('flex-1 bg-background')}>
      {/* Search and Filters Header */}
      <View style={tw('p-5 bg-surface border-b border-zinc-800/50')}>
        <TextInput
          style={tw('w-full bg-background px-4 py-3.5 rounded-xl text-textHigh border border-transparent text-sm mb-4')}
          placeholder="Search by ID, detail, type..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {/* Type Filter Buttons */}
        <View style={tw('mb-3')}>
          <Text style={tw('text-xs text-textMuted font-semibold mb-2')}>Service Category</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={types}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedType(item.value)}
                style={[
                  tw('px-4 py-2 rounded-xl mr-2 border border-zinc-800/30 bg-background'),
                  selectedType === item.value ? tw('bg-primaryDark border-primary') : {},
                ]}
              >
                <Text
                  style={[
                    tw('text-xs font-semibold text-textMuted'),
                    selectedType === item.value ? tw('text-primary') : {},
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Status Filter Buttons */}
        <View>
          <Text style={tw('text-xs text-textMuted font-semibold mb-2')}>Transaction Status</Text>
          <View style={tw('flex-row')}>
            {statuses.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedStatus(item.value)}
                style={[
                  tw('px-4 py-2 rounded-xl mr-2 border border-zinc-800/30 bg-background'),
                  selectedStatus === item.value ? tw('bg-primaryDark border-primary') : {},
                ]}
              >
                <Text
                  style={[
                    tw('text-xs font-semibold text-textMuted'),
                    selectedStatus === item.value ? tw('text-primary') : {},
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Ledger list */}
      {loading ? (
        <View style={tw('p-5 gap-4')}>
          {[1, 2, 3, 4, 5].map((x) => (
            <View key={x} style={tw('bg-surface p-4 rounded-xl')}>
              <View style={tw('flex-row justify-between mb-2')}>
                <Skeleton width={80} height={16} />
                <Skeleton width={60} height={16} />
              </View>
              <Skeleton width="90%" height={14} style={tw('mb-1')} />
              <Skeleton width={120} height={10} />
            </View>
          ))}
        </View>
      ) : filteredTxs.length === 0 ? (
        <View style={tw('flex-1 items-center justify-center p-6')}>
          <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} style={tw('mb-2')} />
          <Text style={tw('text-base text-textMuted font-semibold')}>No transactions found</Text>
          <Text style={tw('text-xs text-textMuted mt-1')}>Try clearing filters or search term.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTxs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={tw('p-5 gap-4')}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
          }
          renderItem={({ item }) => (
            <View style={tw('bg-surface p-4 rounded-xl border border-zinc-800/20')}>
              {/* Header: Type and Amount */}
              <View style={tw('flex-row items-center justify-between mb-2')}>
                <View style={tw('flex-row items-center')}>
                  <Text style={tw('text-sm font-bold text-textHigh mr-2')}>{item.type}</Text>
                  <Text style={[
                    tw('text-xs font-bold px-2 py-0.5 rounded-full'),
                    {
                      backgroundColor: getStatusColor(item.status) + '15',
                      color: getStatusColor(item.status),
                    }
                  ]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={tw('text-base font-bold text-textHigh')}>
                  ₦{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Body: Details description */}
              <Text style={tw('text-sm text-textMuted mb-2 font-medium')}>{item.details}</Text>

              {/* Footer: Date and Ref ID */}
              <View style={tw('flex-row justify-between border-t border-zinc-800/40 pt-2')}>
                <Text style={tw('text-xs text-textMuted')}>{item.date}</Text>
                <Text style={tw('text-xs text-textMuted')}>ID: {item.id.slice(0, 16)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default TransactionsScreen;
