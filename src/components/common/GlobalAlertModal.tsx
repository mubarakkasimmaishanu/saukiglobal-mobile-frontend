// src/components/common/GlobalAlertModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { globalAlertManager, AlertConfig } from '../../utils/globalAlert';
import tw from '../../utils/styles';
import { COLORS } from '../../constants/theme';

export const GlobalAlertModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertConfig | null>(null);

  useEffect(() => {
    globalAlertManager.register((newConfig) => {
      setConfig(newConfig);
      setVisible(true);
    });
    return () => {
      globalAlertManager.unregister();
    };
  }, []);

  if (!visible || !config) return null;

  const { title, message, buttons } = config;

  // Determine status color based on keywords in title/message
  const lowerTitle = title.toLowerCase();
  const lowerMsg = (message || '').toLowerCase();
  
  let statusColor = COLORS.primary; // Green emerald for success/default
  let statusIcon = '✓';
  let iconBg = 'bg-primary/20 border-primary/30';

  if (
    lowerTitle.includes('fail') || 
    lowerTitle.includes('error') || 
    lowerMsg.includes('fail') || 
    lowerMsg.includes('error')
  ) {
    statusColor = COLORS.error; // Red for failure
    statusIcon = '✕';
    iconBg = 'bg-red-500/20 border-red-500/30';
  } else if (
    lowerTitle.includes('pending') || 
    lowerTitle.includes('warn') || 
    lowerTitle.includes('check') ||
    lowerMsg.includes('pending')
  ) {
    statusColor = COLORS.warning; // Amber for warning/pending
    statusIcon = '⚠';
    iconBg = 'bg-amber-500/20 border-amber-500/30';
  }

  const handleButtonPress = (onPress?: () => void) => {
    setVisible(false);
    if (onPress) onPress();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={tw('flex-1 bg-black/60 items-center justify-center p-6')}>
        <View style={tw('w-full max-w-sm bg-surface border border-zinc-800 rounded-3xl p-6 items-center shadow-2xl')}>
          {/* Status Icon */}
          <View style={tw(`w-16 h-16 rounded-full items-center justify-center border-2 ${iconBg} mb-4`)}>
            <Text style={[tw('text-2xl font-bold'), { color: statusColor }]}>{statusIcon}</Text>
          </View>

          {/* Title */}
          <Text style={tw('text-lg font-bold text-textHigh text-center mb-2')}>
            {title}
          </Text>

          {/* Message */}
          {message && (
            <Text style={tw('text-sm text-textMuted text-center mb-6 leading-relaxed px-2')}>
              {message}
            </Text>
          )}

          {/* Buttons Layout */}
          <View style={tw('w-full gap-3')}>
            {buttons && buttons.length > 0 ? (
              buttons.map((btn, i) => {
                const isCancel = btn.style === 'cancel';
                const isDestructive = btn.style === 'destructive';
                
                let btnStyle = 'w-full py-3.5 rounded-xl items-center justify-center';
                let txtStyle = 'text-sm font-bold';

                if (isCancel) {
                  btnStyle += ' bg-zinc-850 border border-zinc-800';
                  txtStyle += ' text-textMuted';
                } else if (isDestructive) {
                  btnStyle += ' bg-red-500/10 border border-red-500/30';
                  txtStyle += ' text-red-500';
                } else {
                  btnStyle += ' bg-primary';
                  txtStyle += ' text-background';
                }

                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    onPress={() => handleButtonPress(btn.onPress)}
                    style={tw(btnStyle)}
                  >
                    <Text style={tw(txtStyle)}>{btn.text || 'OK'}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleButtonPress()}
                style={tw('w-full py-3.5 bg-primary rounded-xl items-center justify-center')}
              >
                <Text style={tw('text-sm font-bold text-background')}>OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GlobalAlertModal;
