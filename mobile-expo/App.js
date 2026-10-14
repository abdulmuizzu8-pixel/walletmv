import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, BackHandler, Linking, Pressable, SafeAreaView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const START_URL = 'https://walletmv.com/?app=1';
const BRAND = '#0B1A2C';
const GOLD = '#D4B26A';

function isWalletMV(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ['walletmv.com', 'www.walletmv.com'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

export default function App() {
  const webRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const openExternal = useCallback(async (url) => {
    try { await Linking.openURL(url); } catch { /* Stay on the current page if the link cannot open. */ }
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webRef.current && canGoBack) {
        webRef.current.goBack();
        return true;
      }
      return false;
    });
    return () => subscription.remove();
  }, [canGoBack]);

  const handleNavigation = useCallback((request) => {
    const url = request?.url || '';
    if (isWalletMV(url) || url === 'about:blank') return true;
    if (/^(https?:|mailto:|tel:|sms:|whatsapp:|intent:)/i.test(url)) {
      openExternal(url);
      return false;
    }
    return false;
  }, [openExternal]);

  const retry = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor={BRAND} barStyle="light-content" />
      <WebView
        key={reloadKey}
        ref={webRef}
        source={{ uri: START_URL }}
        style={styles.webview}
        originWhitelist={['https://*', 'http://*', 'about:*', 'mailto:*', 'tel:*', 'sms:*', 'whatsapp:*', 'intent:*']}
        javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled
        setSupportMultipleWindows pullToRefreshEnabled
        onShouldStartLoadWithRequest={handleNavigation}
        onOpenWindow={({ nativeEvent }) => openExternal(nativeEvent.targetUrl)}
        onNavigationStateChange={(nav) => setCanGoBack(Boolean(nav.canGoBack))}
        onLoadStart={() => { setLoading(true); setLoadError(false); }}
        onLoadEnd={() => setLoading(false)}
        onError={(event) => {
          if (event?.nativeEvent?.isTopFrame !== false) { setLoading(false); setLoadError(true); }
        }}
        onHttpError={(event) => {
          if (event?.nativeEvent?.statusCode >= 500) { setLoading(false); setLoadError(true); }
        }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Opening WalletMV…</Text>
          </View>
        )}
      />
      {loading && !loadError && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Opening WalletMV…</Text>
        </View>
      )}
      {loadError && (
        <View style={styles.errorPanel}>
          <Text style={styles.title}>WalletMV could not connect</Text>
          <Text style={styles.message}>Check your internet connection and try again. WalletMV needs its website to be online before you can sign in.</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND },
  webview: { flex: 1, backgroundColor: '#FAF7F1' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND, gap: 12 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND, gap: 12 },
  loadingText: { color: '#F3ECDC', fontSize: 14 },
  errorPanel: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: BRAND },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  message: { color: '#E3E7ED', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 420 },
  retryButton: { backgroundColor: GOLD, borderRadius: 12, marginTop: 22, paddingVertical: 13, paddingHorizontal: 28 },
  retryText: { color: BRAND, fontWeight: '700', fontSize: 15 },
});
