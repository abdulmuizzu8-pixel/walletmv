import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, AppState, BackHandler, Linking, Platform, Pressable, SafeAreaView,
  StatusBar, StyleSheet, Text, View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

// The store apps use a store-specific presentation that hides package and checkout pages.
// Verify current Google Play and Apple billing/external-purchase rules for each storefront before submission.
// Website updates appear here without a new native build; native changes still require a new build.
const STORE = Platform.OS === 'ios' ? 'ios' : 'android';
const START_URL = `https://walletmv.com/?app=1&store=${STORE}`;
const BRAND = '#0B1A2C';
const GOLD = '#D4B26A';
const LOCK_KEY = 'walletmv.lock';           // 'on' | 'off' (not set = not asked yet)
const RELOCK_AFTER_MS = 60 * 1000;           // lock again after 1 minute in the background

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

  // Face ID / fingerprint lock
  const [ready, setReady] = useState(false);
  const [canLock, setCanLock] = useState(false);
  const [lockOn, setLockOn] = useState(false);
  const [locked, setLocked] = useState(false);
  const lockOnRef = useRef(false);
  const backgroundAt = useRef(0);
  const authBusy = useRef(false);

  const unlock = useCallback(async () => {
    if (authBusy.current) return;
    authBusy.current = true;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock WalletMV',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      if (result.success) setLocked(false);
    } catch {
      // Leave the lock screen up; the person can tap Unlock again.
    } finally {
      authBusy.current = false;
    }
  }, []);

  const saveLock = useCallback(async (on) => {
    lockOnRef.current = on;
    setLockOn(on);
    try { await SecureStore.setItemAsync(LOCK_KEY, on ? 'on' : 'off'); } catch { /* keep the in-memory choice */ }
    webRef.current?.injectJavaScript(
      `window.WalletMVApp&&(window.WalletMVApp.lock=${on ? 'true' : 'false'});window.dispatchEvent(new Event('walletmvapp'));true;`
    );
  }, []);

  useEffect(() => {
    (async () => {
      let has = false;
      let pref = null;
      try {
        has = (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
        pref = await SecureStore.getItemAsync(LOCK_KEY);
      } catch { /* no biometrics on this device */ }
      setCanLock(has);
      const on = has && pref === 'on';
      lockOnRef.current = on;
      setLockOn(on);
      setReady(true);
      if (on) { setLocked(true); unlock(); }
      if (has && pref === null) {
        Alert.alert(
          'Lock WalletMV?',
          Platform.OS === 'ios'
            ? 'Use Face ID or Touch ID to open WalletMV, so only you can see your money.'
            : 'Use your fingerprint or face to open WalletMV, so only you can see your money.',
          [
            { text: 'Not now', style: 'cancel', onPress: () => saveLock(false) },
            { text: 'Turn on', onPress: () => saveLock(true) },
          ],
        );
      }
    })();
  }, [saveLock, unlock]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') backgroundAt.current = Date.now();
      if (state === 'active' && lockOnRef.current && backgroundAt.current && Date.now() - backgroundAt.current > RELOCK_AFTER_MS) {
        setLocked(true);
        unlock();
      }
    });
    return () => sub.remove();
  }, [unlock]);

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
    if (/^(https?:|mailto:|tel:|sms:|whatsapp:|viber:|intent:|geo:)/i.test(url)) {
      openExternal(url);
      return false;
    }
    return false;
  }, [openExternal]);

  // Messages from the website (Settings → "Lock with Face ID / fingerprint")
  const handleMessage = useCallback((event) => {
    let msg = null;
    try { msg = JSON.parse(event?.nativeEvent?.data || 'null'); } catch { return; }
    if (msg && msg.type === 'lock' && canLock) saveLock(!!msg.on);
  }, [canLock, saveLock]);

  const retry = useCallback(() => {
    setLoadError(false);
    setLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  const bridge = `window.WalletMVApp=${JSON.stringify({ platform: STORE, canLock, lock: lockOn, version: 1 })};true;`;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar backgroundColor={BRAND} barStyle="light-content" />
      {ready && (
        <WebView
          key={reloadKey}
          ref={webRef}
          source={{ uri: START_URL }}
          style={styles.webview}
          originWhitelist={['https://*', 'http://*', 'about:*', 'mailto:*', 'tel:*', 'sms:*', 'whatsapp:*', 'viber:*', 'geo:*', 'intent:*']}
          javaScriptEnabled domStorageEnabled sharedCookiesEnabled thirdPartyCookiesEnabled
          setSupportMultipleWindows pullToRefreshEnabled
          allowsBackForwardNavigationGestures
          injectedJavaScriptBeforeContentLoaded={bridge}
          onMessage={handleMessage}
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
      )}
      {(!ready || (loading && !loadError)) && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={styles.loadingText}>Opening WalletMV…</Text>
        </View>
      )}
      {loadError && (
        <View style={styles.errorPanel}>
          <Text style={styles.title}>WalletMV could not connect</Text>
          <Text style={styles.message}>Check your internet connection and try again. Your saved data is safe in your account.</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.retryButton}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      )}
      {locked && (
        <View style={styles.lockPanel} accessibilityViewIsModal>
          <Text style={styles.lockBrand}>WALLET<Text style={{ color: GOLD }}>MV</Text></Text>
          <Text style={styles.title}>WalletMV is locked</Text>
          <Text style={styles.message}>Unlock to see your money.</Text>
          <Pressable accessibilityRole="button" onPress={unlock} style={styles.retryButton}>
            <Text style={styles.retryText}>Unlock</Text>
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
  lockPanel: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 28, backgroundColor: BRAND },
  lockBrand: { color: '#FFFFFF', fontSize: 26, fontWeight: '600', letterSpacing: 4, marginBottom: 28 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  message: { color: '#E3E7ED', fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 420 },
  retryButton: { backgroundColor: GOLD, borderRadius: 12, marginTop: 22, paddingVertical: 13, paddingHorizontal: 28, minWidth: 160, alignItems: 'center' },
  retryText: { color: BRAND, fontWeight: '700', fontSize: 15 },
});
