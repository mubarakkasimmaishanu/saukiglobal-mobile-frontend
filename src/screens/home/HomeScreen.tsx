// src/screens/home/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Share } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Skeleton from '../../components/common/Skeleton';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, refreshProfile } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), refreshProfile()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
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

  // Quick Action List mapping
  const quickActions = [
    { title: 'Buy Airtime', icon: '📱', screen: 'BuyAirtime' },
    { title: 'Buy Data', icon: '📡', screen: 'BuyData' },
    { title: 'Electricity', icon: '⚡', screen: 'PayElectricity' },
    { title: 'Cable TV', icon: '📺', screen: 'PayCable' },
    { title: 'Fund Wallet', icon: '💳', screen: 'WalletTab' }, // Routes to Wallet Tab
    { title: 'Exam Cards', icon: '📝', screen: 'ExamScratch' },
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
          <TouchableOpacity onPress={() => setHideBalance(!hideBalance)} style={tw('px-2 py-1')}>
            <Text style={tw('text-primary font-bold text-sm')}>{hideBalance ? '👁 Show' : '👁 Hide'}</Text>
          </TouchableOpacity>
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
      </Card>

      {/* Quick Actions Grid */}
      <View style={tw('mb-6')}>
        <Text style={tw('text-base font-bold text-textHigh mb-4')}>Quick Actions</Text>
        
        <View style={tw('flex-row flex-wrap gap-4 justify-between')}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (action.screen === 'WalletTab') {
                  navigation.navigate('WalletTab');
                } else {
                  navigation.navigate(action.screen);
                }
              }}
              style={[
                tw('bg-surface items-center justify-center p-4 rounded-2xl w-[30%] border border-zinc-800/30'),
                { minHeight: 90 }
              ]}
            >
              <Text style={tw('text-2xl mb-2')}>{action.icon}</Text>
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
