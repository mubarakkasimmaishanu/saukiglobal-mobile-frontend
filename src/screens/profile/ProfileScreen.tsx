// src/screens/profile/ProfileScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/services';
import tw from '../../utils/styles';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async () => {
    if (!firstName || !lastName || !phone) {
      Alert.alert('Validation Error', 'All profile fields are required.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateProfile({ firstName, lastName, phone });
      if (res.status) {
        await refreshProfile();
        Alert.alert('Success', 'Profile updated successfully.');
        setEditing(false);
      } else {
        Alert.alert('Failed', res.message || 'Could not update profile');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of SaukiGlobal?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems = [
    { title: 'Change Password', desc: 'Update account password', icon: '🔒', screen: 'ChangePassword' },
    { title: 'PIN Management', desc: 'Set, Change, Toggle or Recover PIN', icon: '🔑', screen: 'PinManagement' },
    { title: 'Support & Helpdesk', desc: 'Contact us on WhatsApp, Email, Telegram', icon: '📞', screen: 'Support' },
  ];

  return (
    <ScrollView style={tw('flex-1 bg-background')} contentContainerStyle={tw('p-5')}>
      {/* Profile Overview Card */}
      <Card style={tw('mb-6 bg-surface')}>
        <View style={tw('items-center pb-4 border-b border-zinc-800/40 mb-4')}>
          <View style={tw('w-20 h-20 bg-primaryDark/30 rounded-full items-center justify-center mb-3')}>
            <Text style={tw('text-4xl')}>👤</Text>
          </View>
          <Text style={tw('text-lg font-bold text-textHigh')}>{user?.name || 'Subscriber'}</Text>
          <Text style={tw('text-xs text-textMuted mt-1')}>{user?.email}</Text>
          
          <View style={tw('flex-row gap-2 mt-3')}>
            <View style={tw('bg-primaryDark/20 px-3 py-1 rounded-full border border-primary/10')}>
              <Text style={tw('text-xs text-primary font-semibold')}>{user?.tier || 'Member'}</Text>
            </View>
            <View style={tw('bg-zinc-800 px-3 py-1 rounded-full')}>
              <Text style={tw('text-xs text-textHigh font-semibold')}>Code: {user?.referralCode}</Text>
            </View>
          </View>
        </View>

        {editing ? (
          <View>
            <Input label="First Name" value={firstName} onChangeText={setFirstName} />
            <Input label="Last Name" value={lastName} onChangeText={setLastName} />
            <Input label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            
            <View style={tw('flex-row gap-4 mt-2')}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditing(false)}
                style={tw('flex-1 py-3')}
              />
              <Button
                title="Save"
                onPress={handleUpdateProfile}
                loading={saving}
                style={tw('flex-1 py-3')}
              />
            </View>
          </View>
        ) : (
          <View style={tw('gap-3')}>
            <View style={tw('flex-row justify-between')}>
              <Text style={tw('text-sm text-textMuted')}>Phone Number</Text>
              <Text style={tw('text-sm text-textHigh font-medium')}>{user?.phone || 'N/A'}</Text>
            </View>
            <View style={tw('flex-row justify-between')}>
              <Text style={tw('text-sm text-textMuted')}>Registered Email</Text>
              <Text style={tw('text-sm text-textHigh font-medium')}>{user?.email}</Text>
            </View>
            
            <Button
              title="Edit Profile"
              variant="outline"
              onPress={() => {
                setFirstName(user?.firstName || '');
                setLastName(user?.lastName || '');
                setPhone(user?.phone || '');
                setEditing(true);
              }}
              style={tw('mt-2 py-3')}
            />
          </View>
        )}
      </Card>

      {/* Menu Settings list */}
      <View style={tw('bg-surface rounded-2xl overflow-hidden border border-zinc-800/20 mb-6')}>
        {menuItems.map((item, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(item.screen)}
            style={[
              tw('p-4 flex-row items-center border-b border-zinc-800/35'),
              i === menuItems.length - 1 ? { borderBottomWidth: 0 } : {}
            ]}
          >
            <Text style={tw('text-xl mr-4')}>{item.icon}</Text>
            
            <View style={tw('flex-1')}>
              <Text style={tw('text-sm font-semibold text-textHigh mb-0.5')}>{item.title}</Text>
              <Text style={tw('text-xs text-textMuted')}>{item.desc}</Text>
            </View>
            
            <Text style={tw('text-primary font-bold text-base px-1')}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <Button
        title="Sign Out"
        variant="danger"
        onPress={handleLogout}
        style={tw('mb-10')}
      />
    </ScrollView>
  );
};

export default ProfileScreen;
