// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Share, Alert, Clipboard, Modal, TextInput, Image, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getVirtualAccounts, createVirtualAccount, getTransactions, TransactionItem } from '../../api/services';
import tw from '../../utils/styles';
import Skeleton from '../../components/common/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [greeting, setGreeting] = useState('');

  // KYC Modal States
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycOption, setKycOption] = useState<'nin' | 'bvn'>('bvn');
  const [kycValue, setKycValue] = useState('');
  const [kycError, setKycError] = useState<string | null>(null);
  const [isGeneratingVa, setIsGeneratingVa] = useState(false);
  const [vaSuccessMsg, setVaSuccessMsg] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      if (res.status && res.data) {
        setStats(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const res = await getVirtualAccounts();
      if (res.status && Array.isArray(res.data)) {
        setAccounts(res.data);
      }
    } catch (e) {
      console.error('Failed to load virtual accounts', e);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await getTransactions({ limit: 5 });
      if (res.status && Array.isArray(res.data)) {
        setRecentTransactions(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch recent transactions', e);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchAccounts(), fetchRecentTransactions(), refreshProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    fetchStats();
    fetchAccounts();
    fetchRecentTransactions();
  }, []);

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    setCopiedText(text);
    Alert.alert('Copied!', `${label} copied to clipboard.`);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleGenerateAccounts = async () => {
    if (!/^\d{11}$/.test(kycValue)) {
      setKycError(`${kycOption.toUpperCase()} must be exactly 11 digits.`);
      return;
    }
    setKycError(null);
    setIsGeneratingVa(true);
    try {
      const bvn = kycOption === 'bvn' ? kycValue : undefined;
      const nin = kycOption === 'nin' ? kycValue : undefined;
      const res = await createVirtualAccount(bvn, nin);
      if (res.status) {
        setVaSuccessMsg('Accounts generated successfully!');
        await fetchAccounts();
        setTimeout(() => {
          setShowKycModal(false);
          setVaSuccessMsg(null);
          setKycValue('');
        }, 1500);
      } else {
        setKycError(res.message || 'Failed to generate virtual accounts.');
      }
    } catch (err: any) {
      setKycError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsGeneratingVa(false);
    }
  };

  // Ecosystem grid mappings (styled as rounded cards)
  const quickActions = [
    { title: 'Data', icon: 'wifi-outline', screen: 'BuyData', available: true },
    { title: 'Airtime', icon: 'phone-portrait-outline', screen: 'BuyAirtime', available: true },
    { title: 'Cable TV', icon: 'tv-outline', screen: 'PayCable', available: true },
    { title: 'Power', icon: 'flash-outline', screen: 'PayElectricity', available: true },
    
    { title: 'Exams', icon: 'school-outline', screen: 'ExamScratch', available: false },
    { title: 'Alpha', icon: 'radio-outline', screen: 'AlphaCall', available: false },
    { title: 'Kirani', icon: 'globe-outline', screen: 'KiraniAirtime', available: false },
    { title: 'Smile', icon: 'mic-outline', screen: 'SmileVoice', available: false },

    { title: 'A2C', icon: 'swap-horizontal-outline', screen: 'AirtimeToCash', available: false },
    { title: 'NIN', icon: 'finger-print-outline', screen: 'NINPrint', available: false },
    { title: 'History', icon: 'TransactionsTab', screen: 'TransactionsTab', available: true, tabNav: true },
    { title: 'eSIM', icon: 'barcode-outline', screen: 'BuyEsim', available: false },

    { title: 'CAC', icon: 'briefcase-outline', screen: 'CACReg', available: false },
    { title: 'Intl', icon: 'airplane-outline', screen: 'IntlTopup', available: false },
    { title: 'More', icon: 'grid-outline', screen: 'ServicesTab', available: true, tabNav: true },
  ];

  const handleActionPress = (action: any) => {
    if (action.available) {
      navigation.navigate(action.screen);
    } else {
      Alert.alert(
        'Service Unavailable',
        'This service is temporarily unavailable. We are currently focusing on Airtime, Data, TV, and Electricity purchases.'
      );
    }
  };

  return (
    <ScrollView
      style={tw('flex-1 bg-background')}
      contentContainerStyle={tw('p-5')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Header Profile Greeting */}
      <View style={tw('flex-row items-center justify-between mb-6 pt-3')}>
        <View style={tw('flex-row items-center')}>
          {/* SK Rounded Logo */}
          <Image 
            source={require('../../../assets/icon.png')} 
            style={{ width: 44, height: 44, borderRadius: 12, marginRight: 12 }} 
          />
          <View>
            <Text style={tw('text-[9px] text-primary font-bold uppercase tracking-widest mb-0.5')}>{greeting}</Text>
            <Text style={tw('text-white text-lg font-black')}>@{user?.name?.toLowerCase().replace(/\s+/g, '') || 'subscriber'}</Text>
          </View>
        </View>

        {/* Avatar circle and Notifications bell button */}
        <View style={tw('flex-row items-center')}>
          <View style={tw('w-10 h-10 rounded-full bg-primary items-center justify-center shadow-lg mr-3 shadow-primary/20')}>
            <Text style={tw('text-black font-black text-base')}>
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert('Notifications', 'You have no new notifications.')}
            style={tw('w-10 h-10 bg-[#121c17] rounded-full items-center justify-center border border-white/5 relative')}
          >
            <Ionicons name="notifications-outline" size={18} color={COLORS.textHigh} />
            <View style={tw('absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-primary')} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Balance Card */}
      <View style={[
        tw('p-6 mb-6 relative overflow-hidden border border-primary/25 shadow-2xl'),
        { borderRadius: 32, backgroundColor: '#0a1811' }
      ]}>
        {/* Tier/Level Badge at top right */}
        <View style={tw('position-absolute top-5 right-5 bg-[#0a2214] border border-[#66df75]/30 px-3 py-1.5 rounded-full')}>
          <Text style={tw('text-[9px] text-primary font-black uppercase tracking-widest')}>
            {user?.tier || 'PREMIUM'}
          </Text>
        </View>

        {/* Available Balance label and amount */}
        <View style={tw('mb-6 mt-2')}>
          <View style={tw('flex-row items-center gap-2 mb-1.5')}>
            <Text style={tw('text-[9px] font-black text-textMuted uppercase tracking-widest')}>Available Balance</Text>
            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)} style={tw('p-1 rounded-lg')}>
              <Ionicons name={hideBalance ? "eye-off-outline" : "eye-outline"} size={13} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          <Text style={tw('text-3xl font-black text-white tracking-tight')}>
            {hideBalance ? '₦ ••••••••' : `₦${(stats?.wallet?.balance ?? user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
        </View>

        {/* Fund and Transfer Buttons */}
        <View style={tw('flex-row gap-4 mb-6')}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('WalletTab')}
            style={tw('flex-1 bg-primary py-3 rounded-full flex-row items-center justify-center gap-1.5 shadow-lg shadow-primary/20')}
          >
            <Ionicons name="add-circle-outline" size={16} color="#111415" />
            <Text style={tw('text-xs font-black text-black uppercase tracking-wider')}>Fund</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert('Coming Soon', 'Wallet transfers are currently being configured for mobile.')}
            style={tw('flex-1 bg-[#121c17] border border-white/10 py-3 rounded-full flex-row items-center justify-center gap-1.5')}
          >
            <Ionicons name="send-outline" size={14} color="white" />
            <Text style={tw('text-xs font-black text-white uppercase tracking-wider')}>Transfer</Text>
          </TouchableOpacity>
        </View>

        {/* Virtual Accounts inside the Balance Card */}
        <View style={tw('border-t border-white/5 pt-4')}>
          {loadingAccounts ? (
            <ActivityIndicator color={COLORS.primary} size="small" style={tw('py-2')} />
          ) : accounts.length > 0 ? (
            <View>
              <Text style={tw('text-[9px] font-black text-primary uppercase tracking-widest mb-3')}>
                Your Virtual Transfer Accounts
              </Text>
              <View style={tw('flex-col gap-2')}>
                {accounts.map((acc, i) => (
                  <View key={i} style={[
                    tw('p-4 border border-white/5 flex-col justify-start mb-2'),
                    { borderRadius: 18, backgroundColor: '#07100b' }
                  ]}>
                    <View style={tw('flex-row items-center mb-1')}>
                      <Text style={tw('text-xs font-bold text-white')}>{acc.bank_name}</Text>
                      <View style={tw('bg-[#0a2214] px-2 py-0.5 rounded ml-2')}>
                        <Text style={tw('text-[8px] text-primary font-black tracking-wider uppercase')}>Instant</Text>
                      </View>
                    </View>
                    <View style={tw('flex-row items-center mb-1')}>
                      <Text style={tw('text-base font-black font-mono text-white')}>{acc.account_number}</Text>
                      <TouchableOpacity onPress={() => handleCopy(acc.account_number, 'Account number')} style={tw('ml-3')}>
                        <Text style={tw('text-[9px] text-[#71717a] font-bold underline uppercase tracking-widest')}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={tw('text-[8px] text-textMuted font-bold uppercase tracking-wider truncate')}>{acc.account_name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={tw('flex-col items-center justify-center p-2')}>
              <Text style={tw('text-[10px] text-textMuted text-center font-bold mb-3 leading-relaxed')}>
                No transfer account generated. Fund instantly via direct bank transfer.
              </Text>
              <TouchableOpacity
                onPress={() => setShowKycModal(true)}
                style={tw('w-full bg-[#0a2214] border border-[#66df75]/20 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5')}
              >
                <Ionicons name="add-circle" size={14} color={COLORS.primary} />
                <Text style={tw('text-[10px] font-bold text-primary uppercase tracking-wider')}>Get Transfer Accounts</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Services Grid Section */}
      <View style={tw('mb-6')}>
        <View style={tw('flex-row items-center mb-4')}>
          <Text style={tw('text-[9px] font-black uppercase tracking-widest text-primary')}>Ecosystem Services</Text>
          <View style={tw('flex-1 h-[1px] bg-[#66df75]/25 ml-3')} />
        </View>

        <View style={tw('flex-row flex-wrap gap-2.5 justify-start')}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={action.available ? 0.7 : 1}
              onPress={() => handleActionPress(action)}
              style={[
                tw('items-center justify-center mb-3'),
                { width: '23%' },
                !action.available ? tw('opacity-45') : {}
              ]}
            >
              <View style={tw('w-14 h-14 bg-[#121c17] items-center justify-center rounded-2xl border border-white/5 mb-1.5')}>
                <Ionicons name={action.icon as any} size={22} color={action.available ? COLORS.textHigh : COLORS.textMuted} />
                {!action.available && (
                  <View style={tw('position-absolute -top-1 -right-2 bg-zinc-800/90 rounded-full p-0.5')}>
                    <Ionicons name="lock-closed" size={9} color={COLORS.warning} />
                  </View>
                )}
              </View>
              <Text style={tw('text-[9px] font-black text-primary text-center uppercase tracking-wider')} numberOfLines={1}>
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Activity Summary Stats */}
      <View style={tw('mb-6 bg-[#0a1811] p-5 rounded-3xl border border-white/5 shadow')}>
        <Text style={tw('text-xs font-bold uppercase tracking-widest text-primary mb-4')}>Activity Summary</Text>
        <View style={tw('flex-row justify-between gap-4')}>
          <View style={tw('bg-background border border-white/5 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Success</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-base font-bold text-primary')}>{stats?.transactions?.success ?? 0}</Text>
            )}
          </View>

          <View style={tw('bg-background border border-white/5 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Pending</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-base font-bold text-warning')}>{stats?.transactions?.pending ?? 0}</Text>
            )}
          </View>

          <View style={tw('bg-background border border-white/5 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Failed</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-base font-bold text-error')}>{stats?.transactions?.failed ?? 0}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Recent Activity Ledger List */}
      <View style={tw('mb-10')}>
        <View style={tw('flex-row justify-between items-center mb-4')}>
          <View style={tw('flex-row items-center')}>
            <View style={tw('w-1 h-3.5 bg-primary rounded mr-2')} />
            <Text style={tw('text-xs font-bold uppercase tracking-widest text-primary')}>Recent Activity</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text style={tw('text-xs font-bold text-primary')}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingTransactions ? (
          <ActivityIndicator color={COLORS.primary} size="small" style={tw('py-4')} />
        ) : recentTransactions.length === 0 ? (
          <View style={tw('bg-surface p-6 rounded-2xl items-center justify-center border border-white/5')}>
            <Text style={tw('text-textMuted text-sm')}>No recent transactions</Text>
          </View>
        ) : (
          <View style={tw('flex-col gap-3')}>
            {recentTransactions.map((tx, i) => {
              const isSuccess = tx.status === 'Success';
              const isPending = tx.status === 'Pending';
              const statusColor = isSuccess ? COLORS.primary : isPending ? COLORS.warning : COLORS.error;
              
              return (
                <View key={i} style={tw('bg-surface p-4 rounded-2xl border border-white/5 flex-row items-center justify-between shadow')}>
                  <View style={tw('flex-row items-center flex-1 mr-2')}>
                    <View style={[
                      tw('w-9 h-9 items-center justify-center rounded-xl mr-3'),
                      { backgroundColor: statusColor + '15' }
                    ]}>
                      <Ionicons 
                        name={isSuccess ? "checkmark-circle" : isPending ? "time" : "close-circle"} 
                        size={18} 
                        color={statusColor} 
                      />
                    </View>
                    <View style={tw('flex-1')}>
                      <Text style={tw('text-sm font-semibold text-textHigh mb-0.5')}>{tx.type}</Text>
                      <Text style={tw('text-[10px] text-textMuted')} numberOfLines={1}>{tx.details || tx.date}</Text>
                    </View>
                  </View>
                  <Text style={[tw('text-sm font-bold'), { color: statusColor }]}>
                    ₦{tx.amount.toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* KYC Verification Modal */}
      <Modal
        visible={showKycModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowKycModal(false)}
      >
        <View style={tw('flex-1 justify-center items-center bg-black opacity-85 position-absolute w-full h-full')} />
        
        <View style={tw('flex-1 justify-center items-center p-5')}>
          <View style={tw('bg-[#0b120c] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl')}>
            
            {/* Modal Header */}
            <View style={tw('flex-row justify-between items-center mb-4 border-b border-white/5 pb-3')}>
              <Text style={tw('text-sm font-bold text-textHigh uppercase tracking-wider')}>Get Transfer Accounts</Text>
              <TouchableOpacity onPress={() => setShowKycModal(false)}>
                <Text style={tw('text-primary font-bold text-xs uppercase tracking-widest')}>Close</Text>
              </TouchableOpacity>
            </View>

            {vaSuccessMsg ? (
              <View style={tw('py-6 items-center')}>
                <View style={tw('w-12 h-12 bg-primary/10 rounded-full items-center justify-center mb-3')}>
                  <Ionicons name="checkmark-circle" size={28} color={COLORS.primary} />
                </View>
                <Text style={tw('text-xs text-textHigh font-bold text-center')}>{vaSuccessMsg}</Text>
              </View>
            ) : (
              <View style={tw('flex-col gap-4')}>
                <Text style={tw('text-[10px] text-textMuted leading-normal')}>
                  To comply with Central Bank regulations, please provide your BVN or NIN to generate your personal virtual transfer accounts instantly.
                </Text>

                {kycError && (
                  <View style={tw('p-3 bg-error/10 border border-error/20 rounded-xl')}>
                    <Text style={tw('text-error text-[10px] font-bold')}>{kycError}</Text>
                  </View>
                )}

                {/* Tab selector */}
                <View style={tw('flex-row gap-3')}>
                  <TouchableOpacity
                    onPress={() => { setKycOption('bvn'); setKycValue(''); setKycError(null); }}
                    style={[
                      tw('flex-1 py-2.5 rounded-xl border items-center justify-center'),
                      kycOption === 'bvn' ? tw('bg-primary/10 border-primary/40') : tw('bg-white/5 border-transparent')
                    ]}
                  >
                    <Text style={[tw('text-xs uppercase font-bold'), kycOption === 'bvn' ? tw('text-primary') : tw('text-textMuted')]}>BVN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setKycOption('nin'); setKycValue(''); setKycError(null); }}
                    style={[
                      tw('flex-1 py-2.5 rounded-xl border items-center justify-center'),
                      kycOption === 'nin' ? tw('bg-primary/10 border-primary/40') : tw('bg-white/5 border-transparent')
                    ]}
                  >
                    <Text style={[tw('text-xs uppercase font-bold'), kycOption === 'nin' ? tw('text-primary') : tw('text-textMuted')]}>NIN</Text>
                  </TouchableOpacity>
                </View>

                {/* Numeric Input */}
                <View style={tw('flex-col gap-2')}>
                  <Text style={tw('text-[9px] font-bold text-primary uppercase tracking-widest')}>
                    Enter {kycOption.toUpperCase()}
                  </Text>
                  <TextInput
                    value={kycValue}
                    onChangeText={(val) => setKycValue(val.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    maxLength={11}
                    placeholder="11-digit number"
                    placeholderTextColor="rgba(255,255,255,0.15)"
                    style={tw('w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-textHigh text-base font-bold text-center tracking-widest')}
                  />
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  onPress={handleGenerateAccounts}
                  disabled={isGeneratingVa || kycValue.length !== 11}
                  style={[
                    tw('w-full bg-primary py-3.5 mt-2 rounded-xl items-center justify-center shadow-lg'),
                    (isGeneratingVa || kycValue.length !== 11) ? tw('opacity-50') : {}
                  ]}
                >
                  {isGeneratingVa ? (
                    <ActivityIndicator color="#111415" size="small" />
                  ) : (
                    <Text style={tw('text-xs font-bold text-black uppercase tracking-wider')}>Generate Accounts</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default HomeScreen;
