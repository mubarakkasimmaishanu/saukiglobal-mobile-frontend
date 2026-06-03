// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Share, Alert, Clipboard } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats, getVirtualAccounts } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchAccounts(), refreshProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
    fetchAccounts();
  }, []);

  const shareReferral = async () => {
    if (!user) return;
    try {
      await Share.share({
        message: `Join SaukiGlobal, the fastest and most secure VTU platform! Use my referral code: ${user.referralCode || ('SAUKI' + user.id)} to sign up. Download now!`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Quick Action List mapping using premium outline icons (ordered: Airtime, Data, Ratel, Kirani, Alpha, Smile, E-sims)
  const quickActions = [
    { title: 'Airtime', icon: 'phone-portrait-outline', screen: 'BuyAirtime' },
    { title: 'Data', icon: 'wifi-outline', screen: 'BuyData' },
    { title: 'Ratel', icon: 'call-outline', screen: 'RatelAirtime' },
    { title: 'Kirani', icon: 'globe-outline', screen: 'KiraniAirtime' },
    { title: 'Alpha', icon: 'radio-outline', screen: 'AlphaCall' },
    { title: 'Smile', icon: 'mic-outline', screen: 'SmileVoice' },
    { title: 'E-sims', icon: 'barcode-outline', screen: 'BuyEsim' },
  ];

  return (
    <ScrollView
      style={tw('flex-1 bg-background')}
      contentContainerStyle={tw('p-5')}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#10b981" />
      }
    >
      {/* Header Profile Greeting */}
      <View style={tw('flex-row items-center justify-between mb-6')}>
        <View>
          <Text style={tw('text-textMuted text-sm font-medium')}>Welcome back,</Text>
          <Text style={tw('text-textHigh text-xl font-bold')}>{user?.name || 'Subscriber'}</Text>
        </View>
        
        {/* Tier/Level Badge */}
        <View style={tw('bg-primaryDark px-3 py-1.5 rounded-full')}>
          <Text style={tw('text-xs text-primary font-bold')}>{user?.tier || 'Member'}</Text>
        </View>
      </View>

      {/* Main Balance Card */}
      <Card style={tw('mb-6 relative overflow-hidden bg-surface')}>
        <View style={tw('flex-row items-center justify-between mb-2')}>
          <Text style={tw('text-textMuted text-sm font-medium')}>Wallet Balance</Text>
          
          <View style={tw('flex-row items-center')}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('WalletTab')}
              style={tw('bg-primaryDark/30 border border-primary/20 px-2.5 py-1 rounded-lg flex-row items-center mr-2')}
            >
              <Text style={tw('text-primary font-bold text-xs')}>+ Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setHideBalance(!hideBalance)} style={tw('px-2 py-1 bg-zinc-800/30 rounded-lg')}>
              <Text style={tw('text-textHigh font-medium text-xs')}>{hideBalance ? '👁 Show' : '👁 Hide'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <Skeleton width="60%" height={32} style={tw('my-1')} />
        ) : (
          <Text style={tw('text-3xl font-bold text-textHigh mb-4')}>
            {hideBalance ? '₦ ••••' : `₦${(stats?.wallet?.balance ?? user?.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          </Text>
        )}

        <View style={tw('flex-row border-t border-zinc-800/50 pt-4 mt-1 justify-between')}>
          <View>
            <Text style={tw('text-textMuted text-xs mb-1')}>Referral Earnings</Text>
            {loading ? (
              <Skeleton width={80} height={16} />
            ) : (
              <Text style={tw('text-textHigh text-sm font-semibold')}>
                ₦{(stats?.wallet?.referral_commission ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            )}
          </View>
          
          <View style={tw('items-end')}>
            <Text style={tw('text-textMuted text-xs mb-1')}>KYC Status</Text>
            <Text style={[
              tw('text-xs font-bold px-2 py-0.5 rounded-full'),
              (stats?.kyc_status === 'verified') 
                ? tw('bg-primaryDark text-primary') 
                : tw('bg-zinc-800 text-warning')
            ]}>
              {(stats?.kyc_status === 'verified') ? 'VERIFIED' : 'UNVERIFIED'}
            </Text>
          </View>
        </View>

        {/* Virtual Accounts inside the Balance Card */}
        {!loadingAccounts && accounts.length > 0 && (
          <View style={tw('border-t border-zinc-800/50 pt-4 mt-4')}>
            <Text style={tw('text-textMuted text-[10px] font-bold mb-2 tracking-wider uppercase')}>
              Virtual Funding Accounts (PayVessel)
            </Text>
            <View style={tw('flex-col gap-2')}>
              {accounts.map((acc, i) => (
                <View key={i} style={tw('flex-row items-center justify-between bg-black/20 p-2.5 rounded-lg border border-zinc-800/10')}>
                  <View style={tw('flex-1 mr-2')}>
                    <Text style={tw('text-xs font-bold text-textHigh')}>{acc.bank_name}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(acc.account_number);
                        Alert.alert('Copied!', `${acc.bank_name} account number copied to clipboard.`);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={tw('text-sm font-mono text-primary font-bold')}>{acc.account_number}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={tw('items-end flex-1')}>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(acc.account_name);
                        Alert.alert('Copied!', 'Account name copied to clipboard.');
                      }}
                      activeOpacity={0.7}
                      style={tw('w-full items-end')}
                    >
                      <Text style={tw('text-[10px] text-textMuted text-right')} numberOfLines={1} ellipsizeMode="tail">
                        {acc.account_name}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(acc.account_number);
                        Alert.alert('Copied!', `${acc.bank_name} account number copied to clipboard.`);
                      }}
                      style={tw('mt-1 bg-primaryDark/30 px-2 py-0.5 rounded')}
                    >
                      <Text style={tw('text-[10px] text-primary font-bold')}>Copy No</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Card>

      {/* Quick Actions Grid */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-4')}>Quick Actions</Text>
        
        <View style={tw('flex-row flex-wrap gap-4 justify-start')}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(action.screen)}
              style={[
                tw('bg-surface items-center justify-center p-4 rounded-2xl w-[30%] border border-zinc-800/30'),
                { minHeight: 90 }
              ]}
            >
              <View style={tw('mb-2')}>
                <Ionicons name={action.icon as any} size={24} color={COLORS.primary} />
              </View>
              <Text style={tw('text-xs font-medium text-textHigh text-center')}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction Summaries Card */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-4')}>Activity Summary</Text>
        
        <View style={tw('flex-row justify-between gap-4')}>
          <View style={tw('bg-surface border border-zinc-800/20 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Success</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-lg font-bold text-primary')}>{stats?.transactions?.success ?? 0}</Text>
            )}
          </View>

          <View style={tw('bg-surface border border-zinc-800/20 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Pending</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-lg font-bold text-warning')}>{stats?.transactions?.pending ?? 0}</Text>
            )}
          </View>

          <View style={tw('bg-surface border border-zinc-800/20 p-4 rounded-xl flex-1 items-center')}>
            <Text style={tw('text-xs text-textMuted mb-1')}>Failed</Text>
            {loading ? (
              <Skeleton width={30} height={20} />
            ) : (
              <Text style={tw('text-lg font-bold text-error')}>{stats?.transactions?.failed ?? 0}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Referral Advertisement Card */}
      <Card style={tw('bg-surface/50 border border-primaryDark/20 flex-row items-center justify-between p-4 mb-6')}>
        <View style={tw('flex-1 pr-4')}>
          <Text style={tw('text-sm font-semibold text-textHigh mb-1')}>Earn on Referrals</Text>
          <Text style={tw('text-xs text-textMuted')}>Share your code & get commissions on all their funding!</Text>
        </View>
        <TouchableOpacity
          onPress={shareReferral}
          style={tw('bg-primary px-4 py-2 rounded-xl')}
        >
          <Text style={tw('text-xs font-bold text-black')}>Invite</Text>
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

export default HomeScreen;
