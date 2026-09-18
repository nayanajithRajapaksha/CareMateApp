import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheetTouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  FlatList,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Animated,
  PanResponder} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Search,
  Crosshair,
  ChevronDown,
  MapPin,
  Smile,
  CornerUpRight,
  ArrowUpDown,
  Navigation,
  X,
  Route,
  Clock,
  XCircle} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { colors, layout } from '../theme';
import { clinicService, Clinic } from '../services/clinicService';

const { width, height } = Dimensions.get('window');
const FILTERS = ['All Specialities', 'Pediatrics', 'Maternity', 'Vaccinations'];

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// ─── Build Leaflet HTML ──────────────────────────────────────────────────────
// Uses:
//  - OSM tile layer (no key)
//  - OSRM public routing API (no key) for in-app directions
//  - postMessage → React Native on clinic select / route ready
//  - window.* API callable via injectJavaScript from React Native
const buildMapHtml = (clinics: Clinic[]) => {
  const clinicsJson = JSON.stringify(clinics);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body, #map { height:100%; width:100%; font-family:sans-serif; }

    /* MOH clinic marker */
    .moh-wrap { display:flex; flex-direction:column; align-items:center; }
    .moh-badge {
      background:#167979; color:#fff; font-size:9px; font-weight:800;
      padding:2px 6px; border-radius:4px; margin-bottom:4px;
      letter-spacing:0.5px; white-space:nowrap;
    }
    .moh-badge.closed { background:#94A3B8; }
    .moh-outer {
      width:40px; height:40px; border-radius:50%;
      background:rgba(22,121,121,0.18);
      display:flex; align-items:center; justify-content:center;
    }
    .moh-inner {
      width:24px; height:24px; border-radius:50%; background:#167979;
      border:2.5px solid #fff;
      display:flex; align-items:center; justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    }
    .moh-inner.closed { background:#94A3B8; }
    .moh-cross {
      width:12px; height:12px; position:relative;
    }
    .moh-cross::before, .moh-cross::after {
      content:''; position:absolute; background:#fff; border-radius:2px;
    }
    .moh-cross::before { width:3px; height:12px; left:4.5px; top:0; }
    .moh-cross::after  { width:12px; height:3px; left:0; top:4.5px; }

    /* Current location */
    .loc-wrap { position:relative; width:32px; height:32px; }
    .loc-pulse {
      position:absolute; inset:0; border-radius:50%;
      background:rgba(59,130,246,0.22);
      animation:pulse 2s ease-out infinite;
    }
    .loc-dot {
      position:absolute; top:8px; left:8px;
      width:16px; height:16px; border-radius:50%;
      background:#3B82F6; border:3px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    }
    @keyframes pulse {
      0%   { transform:scale(1); opacity:0.8; }
      100% { transform:scale(2.8); opacity:0; }
    }

    /* In-app route info card */
    #routeCard {
      display:none; position:absolute; top:12px; right:12px; z-index:1000;
      background:#fff; border-radius:12px; padding:12px 16px;
      box-shadow:0 4px 16px rgba(0,0,0,0.15);
      min-width:140px;
    }
    #routeCard.visible { display:block; }
    .rc-row { display:flex; align-items:center; margin-bottom:6px; }
    .rc-row:last-child { margin-bottom:0; }
    .rc-icon { width:18px; height:18px; margin-right:8px; }
    .rc-label { font-size:13px; color:#64748B; }
    .rc-value { font-size:15px; font-weight:700; color:#0F172A; }
    .rc-close {
      position:absolute; top:6px; right:8px;
      font-size:16px; color:#94A3B8; cursor:pointer; background:none; border:none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="routeCard">
    <button class="rc-close" onclick="clearRoute()">×</button>
    <div class="rc-row">
      <div class="rc-icon">🛣️</div>
      <div><div class="rc-label">Distance</div><div class="rc-value" id="rcDist">-</div></div>
    </div>
    <div class="rc-row">
      <div class="rc-icon">🚌</div>
      <div><div class="rc-label">Travel Time</div><div class="rc-value" id="rcTime">-</div></div>
    </div>
  </div>

  <script>
    var RN = window.ReactNativeWebView;
    var map = L.map('map', { zoomControl:false, attributionControl:false })
               .setView([6.9271, 79.8612], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19 }).addTo(map);

    // ── MOH Clinic Markers ────────────────────────────────────────────────
    var initialClinics = ${clinicsJson};
    var currentMarkers = [];
    var routeLayer = null;
    var locMarker = null;

    window.updateClinics = function(newClinics) {
      // Clear old markers
      currentMarkers.forEach(function(m) { map.removeLayer(m); });
      currentMarkers = [];

      newClinics.forEach(function(c) {
        var isMOH = c.name.toLowerCase().includes('moh') || (c.type && c.type.toLowerCase().includes('moh'));
        var badgePrefix = isMOH ? 'MOH' : 'Clinic';
        var openClass = c.open ? '' : 'closed';
        var badgeHtml = isMOH ? '<div class="moh-badge ' + openClass + '">MOH' + (c.open ? ' ✓' : ' · CLOSED') + '</div>' : '';
        var html =
          '<div class="moh-wrap">' +
            badgeHtml +
            '<div class="moh-outer">' +
              '<div class="moh-inner ' + openClass + '">' +
                '<div class="moh-cross"></div>' +
              '</div>' +
            '</div>' +
          '</div>';
        var icon = L.divIcon({ html:html, className:'', iconAnchor:[20,52], iconSize:[40,60] });
        var m = L.marker([c.lat, c.lng], { icon:icon })
          .addTo(map)
          .on('click', function() {
            if (RN) RN.postMessage(JSON.stringify({ type:'CLINIC_SELECTED', clinic:c }));
          });
        currentMarkers.push(m);
      });
    };

    // Initialize with data
    window.updateClinics(initialClinics);

    // ── Current location marker ───────────────────────────────────────────
    window.showCurrentLocation = function(lat, lng) {
      var html = '<div class="loc-wrap"><div class="loc-pulse"></div><div class="loc-dot"></div></div>';
      if (locMarker) map.removeLayer(locMarker);
      locMarker = L.marker([lat, lng], {
        icon: L.divIcon({ html:html, className:'', iconAnchor:[16,16], iconSize:[32,32] })
      }).addTo(map);
      map.flyTo([lat, lng], 15, { animate:true, duration:1.2 });
    };

    // ── Fly to location ───────────────────────────────────────────────────
    window.goToLocation = function(lat, lng, zoom) {
      map.flyTo([lat, lng], zoom||15, { animate:true, duration:1.2 });
    };

    // ── In-app route via OSRM ─────────────────────────────────────────────
    window.showRoute = function(fromLat, fromLng, toLat, toLng) {
      // Clear existing route
      if (routeLayer) { map.removeLayer(routeLayer); routeLayer=null; }

      var url = 'https://router.project-osrm.org/route/v1/driving/'
                + fromLng + ',' + fromLat + ';'
                + toLng   + ',' + toLat
                + '?overview=full&geometries=geojson';

      fetch(url)
        .then(function(r){ return r.json(); })
        .then(function(data) {
          if (!data.routes || !data.routes[0]) return;
          var route = data.routes[0];
          var coords = route.geometry.coordinates.map(function(c){ return [c[1],c[0]]; });

          // Draw dashed route polyline in teal
          routeLayer = L.polyline(coords, {
            color:'#167979', weight:5, opacity:0.85,
            dashArray:null, lineCap:'round', lineJoin:'round'
          }).addTo(map);
          map.fitBounds(routeLayer.getBounds(), { padding:[40,40] });

          // Format distance and time (Approximate bus transit time: 1.5x driving + 10 mins wait)
          var km   = (route.legs[0].distance / 1000).toFixed(1) + ' km';
          var drivingMins = route.legs[0].duration / 60;
          var transitMins = Math.round(drivingMins * 1.5 + 10) + ' min';
          document.getElementById('rcDist').innerText = km;
          document.getElementById('rcTime').innerText = transitMins;
          document.getElementById('routeCard').classList.add('visible');

          if (RN) RN.postMessage(JSON.stringify({ type:'ROUTE_INFO', distance:km, duration:transitMins }));
        })
        .catch(function(e) {
          if (RN) RN.postMessage(JSON.stringify({ type:'ROUTE_ERROR', msg: e.message }));
        });
    };

    window.clearRoute = function() {
      if (routeLayer) { map.removeLayer(routeLayer); routeLayer=null; }
      document.getElementById('routeCard').classList.remove('visible');
      if (RN) RN.postMessage(JSON.stringify({ type:'ROUTE_CLEARED' }));
    };
  </script>
</body>
</html>
`;
};

// ─── Types ───────────────────────────────────────────────────────────────────
type RouteInfo = { distance: string; duration: string } | null;

// ─── Screen Component ─────────────────────────────────────────────────────────
export const FindClinicScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const webViewRef = useRef<WebView>(null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);

  // Load clinics from backend
  useEffect(() => {
    clinicService.getAll()
      .then(data => {
        setClinics(data);
        if (data.length > 0 && !selectedClinic) {
          setSelectedClinic(data[0]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingClinics(false));
  }, []);

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filter, setFilter] = useState('All Specialities');
  const [sortOption, setSortOption] = useState<'A-Z' | 'Distance'>('A-Z');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Helper for haversine distance in km
  const getDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
  }, []);

  // Compute filtered & sorted clinics
  const sortedClinics = React.useMemo(() => {
    let arr = clinics.filter(c => {
      if (filter === 'All Specialities') return true;
      if (filter === 'Pediatrics') return c.type.toLowerCase().includes('child') || c.type.toLowerCase().includes('pediatric');
      if (filter === 'Maternity') return c.type.toLowerCase().includes('matern') || c.type.toLowerCase().includes('women');
      if (filter === 'Vaccinations') return c.type.toLowerCase().includes('vaccin');
      return true;
    });

    if (sortOption === 'A-Z') {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'Distance' && userCoords) {
      arr.sort((a, b) => {
        const dA = getDistance(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const dB = getDistance(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return dA - dB;
      });
    }
    return arr;
  }, [clinics, filter, sortOption, userCoords, getDistance]);

  const filteredClinics = sortedClinics; // alias for backwards compatibility in this file

  // Filter local state based on query
  const searchResults = sortedClinics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(null);
  const [showingRoute, setShowingRoute] = useState(false);
  
  // Memoize HTML to prevent WebView from reloading when state changes
  const MAP_HTML = React.useMemo(() => buildMapHtml([]), []);

  // Inject updated clinics dynamically
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateClinics) {
          window.updateClinics(${JSON.stringify(filteredClinics)});
        }
        true;
      `);
    }
  }, [filteredClinics]);

  // ── WebView → RN message handler ─────────────────────────────────────────
  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'CLINIC_SELECTED') {
        setSelectedClinic(msg.clinic);
        setRouteInfo(null);
        setShowingRoute(false);
      } else if (msg.type === 'ROUTE_INFO') {
        setRouteInfo({ distance: msg.distance, duration: msg.duration });
        setShowingRoute(true);
      } else if (msg.type === 'ROUTE_CLEARED') {
        setRouteInfo(null);
        setShowingRoute(false);
      } else if (msg.type === 'ROUTE_ERROR') {
        Alert.alert('Routing Error', 'Could not calculate route. Please check your connection.');
      }
    } catch { /* ignore */ }
  }, []);

  // ── Current location ──────────────────────────────────────────────────────
  const handleLocateMe = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Permission', 'Please allow location access to see your position on the map.');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setUserCoords({ lat: latitude, lng: longitude });
      webViewRef.current?.injectJavaScript(
        `window.showCurrentLocation(${latitude}, ${longitude}); true;`,
      );
    } catch {
      Alert.alert('Error', 'Could not retrieve your location. Please try again.');
    }
  }, []);

  // ── Expandable Bottom Sheet (Draggable) ──────────────────────────────────
  const SHEET_HEIGHT = height * 0.75;
  const MINIMIZED_Y = SHEET_HEIGHT - 80; // Shows handle, title, and route info if active
  const PREVIEW_Y = SHEET_HEIGHT - 320;  // Shows one clinic
  const EXPANDED_Y = 0;                  // Fully expanded

  const translateY = useRef(new Animated.Value(PREVIEW_Y)).current;
  const lastY = useRef(PREVIEW_Y);

  const snapTo = useCallback((yValue: number) => {
    Animated.spring(translateY, {
      toValue: yValue,
      useNativeDriver: true,
      bounciness: 4}).start(() => {
      lastY.current = yValue;
    });
  }, [translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        translateY.setOffset(lastY.current);
        translateY.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: translateY }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();
        const currentY = lastY.current + gestureState.dy;
        const velocity = gestureState.vy;

        if (velocity > 1 || currentY > (PREVIEW_Y + MINIMIZED_Y) / 2) {
          snapTo(MINIMIZED_Y);
        } else if (velocity < -1 || currentY < (EXPANDED_Y + PREVIEW_Y) / 2) {
          snapTo(EXPANDED_Y);
        } else {
          snapTo(PREVIEW_Y);
        }
      }})
  ).current;

  // ── Toggle sort option ────────────────────────────────────────────────────
  const handleToggleSort = useCallback(() => {
    if (sortOption === 'A-Z') {
      setSortOption('Distance');
      if (!userCoords) {
        handleLocateMe(); // Ensure we have coordinates for distance sorting
      }
    } else {
      setSortOption('A-Z');
    }
  }, [sortOption, userCoords, handleLocateMe]);

  // ── In-app directions ─────────────────────────────────────────────────────
  const handleDirections = useCallback(async (targetClinic = selectedClinic) => {
    let fromLat = userCoords?.lat;
    let fromLng = userCoords?.lng;

    if (!fromLat || !fromLng) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Required', 'Please allow location access to get directions.');
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        fromLat = loc.coords.latitude;
        fromLng = loc.coords.longitude;
        setUserCoords({ lat: fromLat, lng: fromLng });
        webViewRef.current?.injectJavaScript(
          `window.showCurrentLocation(${fromLat}, ${fromLng}); true;`
        );
      } catch {
        Alert.alert('Error', 'Could not get your location for routing.');
        return;
      }
    }

    if (!targetClinic) return;

    webViewRef.current?.injectJavaScript(
      `window.showRoute(${fromLat}, ${fromLng}, ${targetClinic.lat}, ${targetClinic.lng}); true;`
    );
  }, [userCoords, selectedClinic]);

  const handleClearRoute = useCallback(() => {
    webViewRef.current?.injectJavaScript(`window.clearRoute(); true;`);
  }, []);

  // ── Instant local search — filters clinics, no network call ─────────
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setShowDropdown(text.trim().length > 0 && searchResults.length > 0);
  };

  const handleSelectResult = (clinic: Clinic) => {
    setSearchQuery(clinic.name);
    setShowDropdown(false);
    setSelectedClinic(clinic);
    setRouteInfo(null);
    setShowingRoute(false);
    webViewRef.current?.injectJavaScript(
      `window.goToLocation(${clinic.lat}, ${clinic.lng}, 16); true;`,
    );
  };

  const clearSearch = () => { setSearchQuery(''); setShowDropdown(false); };

  // Helper to render a clinic card
  const renderClinicCard = (clinic: Clinic) => {
    const isRoutingHere = showingRoute && selectedClinic?.id === clinic.id;
    return (
      <View style={styles.clinicCard} key={clinic.id}>
        <View style={styles.clinicCardTopRow}>
          <View style={[styles.statusBadge, !clinic.open && styles.statusBadgeClosed]}>
            <Text style={[styles.statusText, !clinic.open && styles.statusTextClosed]}>
              {clinic.open ? 'OPEN NOW' : 'CLOSED'}
            </Text>
          </View>
          {(clinic.name.toLowerCase().includes('moh') || (clinic.type && clinic.type.toLowerCase().includes('moh'))) && (
            <View style={styles.mohBadge}>
              <Text style={styles.mohBadgeText}>MOH</Text>
            </View>
          )}
        </View>

        <View style={styles.clinicCardMiddleRow}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'ScheduleTab', params: { clinic } })}>
              <Text style={[styles.clinicName, { textDecorationLine: 'underline', color: colors.primary }]}>{clinic.name}</Text>
            </TouchableOpacity>
            <Text style={styles.clinicType}>{clinic.type}</Text>
            <View style={styles.addressRow}>
              <MapPin color={colors.textMuted} size={12} />
              <Text style={styles.clinicAddress}>{clinic.address}</Text>
            </View>
          </View>
          <View style={styles.iconCircle}>
            <Smile color={colors.primary} size={24} />
          </View>
        </View>

        <View style={styles.clinicCardBottomRow}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => navigation.navigate('ClinicDetails', { clinic })}
          >
            <Text style={styles.detailsButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.directionsButton, isRoutingHere && styles.directionsButtonActive]}
            onPress={() => {
              setSelectedClinic(clinic);
              if (isRoutingHere) {
                handleClearRoute();
              } else {
                handleDirections(clinic);
              }
            }}
          >
            <CornerUpRight color={isRoutingHere ? colors.white : colors.primary} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.textDark} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Clinic</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search + Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search color={colors.textMuted} size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinics or locations..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.iconBtn}>
              <X color={colors.textMuted} size={16} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLocateMe} style={styles.iconBtn}>
            <Crosshair color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Local MOH clinics search dropdown */}
        {showDropdown && (
          <View style={styles.dropdown}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleSelectResult(item)}>
                  <View style={styles.dropdownIconWrap}>
                    <View style={styles.dropdownCross} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropdownClinicName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.dropdownClinicMeta}>{item.type} · {item.address}</Text>
                  </View>
                  <View style={[styles.dropdownOpenDot, !item.open && styles.dropdownClosedDot]} />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.dropdownSep} />}
            />
          </View>
        )}

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              {filter === f && <ChevronDown color={colors.white} size={16} style={{ marginLeft: 4 }} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leaflet OSM Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: MAP_HTML }}
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled
          scrollEnabled={false}
          onMessage={handleMessage}
        />

        {/* Locate-me FAB */}
        <TouchableOpacity style={styles.locationFab} onPress={handleLocateMe}>
          <Navigation color={colors.white} size={20} />
        </TouchableOpacity>

        {/* Map legend */}
        <View style={styles.legend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Verified Clinic/Hospital</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: height * 0.75, transform: [{ translateY }] }]}>
        
        {/* Draggable Header Area */}
        <View {...panResponder.panHandlers} style={styles.sheetDragArea}>
          <View style={{ paddingVertical: 12, alignItems: 'center', width: '100%' }}>
            <View style={styles.dragHandle} />
          </View>

          {/* Route info bar (shown when routing is active) */}
          {showingRoute && routeInfo && (
            <View style={styles.routeInfoBar}>
              <View style={styles.routeInfoItem}>
                <Route color={colors.primary} size={16} />
                <Text style={styles.routeInfoValue}>{routeInfo.distance}</Text>
              </View>
              <View style={styles.routeInfoDivider} />
              <View style={styles.routeInfoItem}>
                <Clock color={colors.primary} size={16} />
                <Text style={styles.routeInfoValue}>{routeInfo.duration}</Text>
              </View>
              <TouchableOpacity onPress={handleClearRoute} style={styles.routeClearBtn}>
                <XCircle color="#94A3B8" size={20} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderTitleRow}>
              <Text style={styles.sheetTitle}>Nearby Clinics</Text>
              <Text style={styles.sheetSubtitle}>({filteredClinics.length} locations)</Text>
            </View>
            <TouchableOpacity style={styles.sortButton} onPress={handleToggleSort}>
              <ArrowUpDown color={colors.primary} size={16} style={{ marginRight: 4 }} />
              <Text style={styles.sortText}>Sort: {sortOption}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={selectedClinic ? [selectedClinic, ...filteredClinics.filter(c => c.id !== selectedClinic.id)] : filteredClinics}
          keyExtractor={item => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => renderClinicCard(item)}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FCFC' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 12},
  backButton: { padding: 8, marginLeft: -8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary },

  searchSection: {
    paddingHorizontal: layout.padding,
    zIndex: 100,
    backgroundColor: '#F7FCFC'},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 4},
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: colors.textDark },
  iconBtn: { padding: 4, marginLeft: 2 },

  dropdown: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    maxHeight: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden'},
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12},
  dropdownIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E8F5F5',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12},
  dropdownCross: {
    width: 12, height: 12,
    // Rendered with border trick to form a + cross
    borderTopWidth: 2, borderTopColor: colors.primary,
    borderBottomWidth: 2, borderBottomColor: 'transparent'},
  dropdownClinicName: { fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 2 },
  dropdownClinicMeta: { fontSize: 12, color: '#64748B' },
  dropdownOpenDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10B981', marginLeft: 10},
  dropdownClosedDot: { backgroundColor: '#94A3B8' },
  dropdownSep: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },

  filtersRow: { marginVertical: 12 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    marginRight: 10},
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 14, fontWeight: '500', color: colors.textDark },
  filterTextActive: { color: colors.white },

  mapContainer: { flex: 1, position: 'relative' },
  map: { width, flex: 1 },

  locationFab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8},

  legend: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4},
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: 8},
  legendText: { fontSize: 12, color: '#334155', fontWeight: '500' },

  // Route info bar
  routeInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F5',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C5E8E8'},
  routeInfoItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  routeInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8},
  routeInfoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#C5E8E8',
    marginHorizontal: 12},
  routeClearBtn: { padding: 4 },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#F7FCFC',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: layout.padding,
    paddingBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20},
  sheetDragArea: {
    backgroundColor: 'transparent'},
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16},
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16},
  sheetHeaderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginRight: 8 },
  sheetSubtitle: { fontSize: 14, color: '#64748B' },
  sortButton: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontSize: 14, fontWeight: '600', color: colors.primary },

  clinicCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'},
  clinicCardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  statusBadge: {
    backgroundColor: '#E6F4F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8},
  statusBadgeClosed: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: colors.primary },
  statusTextClosed: { color: '#94A3B8' },
  mohBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6},
  mohBadgeText: { fontSize: 10, fontWeight: 'bold', color: colors.white },

  clinicCardMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16},
  clinicName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  clinicType: { fontSize: 13, color: colors.primary, fontWeight: '500', marginBottom: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  clinicAddress: { fontSize: 13, color: '#475569', marginLeft: 4 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5EFEF',
    justifyContent: 'center',
    alignItems: 'center'},

  clinicCardBottomRow: { flexDirection: 'row', gap: 12 },
  detailsButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center'},
  detailsButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  directionsButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center'},
  directionsButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary}});
