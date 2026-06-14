import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, useMap, Marker, Popup, GeoJSON, CircleMarker } from 'react-leaflet';
import { 
    Activity, Droplets, ShieldCheck, Users, UserPlus, Trash2, Clock, 
    LogOut, ShieldAlert, Globe, Radio, Settings2, Droplet, 
    AlertTriangle, LayoutDashboard, Map as MapIcon, Database, 
    ChevronRight, Box, BarChart3, Info, Navigation, Play, Square, Shield,
    Wifi, WifiOff, Signal, Building2, Phone, Mail, FileText, Bell,
    CheckCircle2, XCircle, Loader2, Zap, Gauge, Timer, Waves,
    ThermometerSun, Beaker, RefreshCw, Power, AlertOctagon,
    MapPin, Layers, Eye, EyeOff, Download, Upload, Settings,
    ChevronDown, ChevronUp, Filter, Search, Calendar, TrendingUp,
    TrendingDown, Minus, CircleDot, Siren, ShieldOff, ShieldBan
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
    getFirestore, doc, getDoc, updateDoc, collection, addDoc, setDoc, 
    deleteDoc, serverTimestamp, query, orderBy, onSnapshot, where,
    getDocs, limit 
} from "firebase/firestore";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import emailjs from '@emailjs/browser';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '[cdnjs.cloudflare.com](https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png)',
    iconUrl: '[cdnjs.cloudflare.com](https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png)',
    shadowUrl: '[cdnjs.cloudflare.com](https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png)',
});

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyAIB8vsM4oLDIG167P_HhZb-tCo35wJPPA",
    authDomain: "equiflow-smc.firebaseapp.com",
    projectId: "equiflow-smc",
    storageBucket: "equiflow-smc.firebasestorage.app",
    messagingSenderId: "701616890993",
    appId: "1:701616890993:web:88e2ef849fea074a68e7d0",
    measurementId: "G-5M9DMPZGVZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// --- SOLAPUR COMPREHENSIVE WARD/PRABHAG DATA ---
// Based on actual Solapur Municipal Corporation administrative divisions
const SOLAPUR_WARDS = [
    // Prabhag 1 - North Solapur
    { 
        id: 'prabhag-1', 
        name: "Prabhag 1 - Akkalkot Road", 
        wardNumbers: [1, 2, 3, 4],
        center: [17.6868, 75.9064],
        bounds: [
            [17.6950, 75.8950], [17.6950, 75.9180], 
            [17.6780, 75.9180], [17.6780, 75.8950]
        ],
        pipeline: [
            [17.6920, 75.9000], [17.6880, 75.9050], 
            [17.6840, 75.9100], [17.6800, 75.9150]
        ],
        color: '#3B82F6',
        reservoirLocation: [17.6900, 75.9020],
        valveLocations: [[17.6880, 75.9050], [17.6840, 75.9100]],
        population: 45000,
        connections: 8500
    },
    // Prabhag 2 - Vijapur Road Area
    { 
        id: 'prabhag-2', 
        name: "Prabhag 2 - Vijapur Road", 
        wardNumbers: [5, 6, 7, 8],
        center: [17.6750, 75.9350],
        bounds: [
            [17.6850, 75.9200], [17.6850, 75.9500], 
            [17.6650, 75.9500], [17.6650, 75.9200]
        ],
        pipeline: [
            [17.6800, 75.9250], [17.6760, 75.9320], 
            [17.6720, 75.9400], [17.6680, 75.9450]
        ],
        color: '#10B981',
        reservoirLocation: [17.6820, 75.9280],
        valveLocations: [[17.6760, 75.9320], [17.6720, 75.9400]],
        population: 52000,
        connections: 9800
    },
    // Prabhag 3 - Hotgi Road
    { 
        id: 'prabhag-3', 
        name: "Prabhag 3 - Hotgi Road", 
        wardNumbers: [9, 10, 11, 12],
        center: [17.6550, 75.9200],
        bounds: [
            [17.6650, 75.9050], [17.6650, 75.9350], 
            [17.6450, 75.9350], [17.6450, 75.9050]
        ],
        pipeline: [
            [17.6620, 75.9100], [17.6580, 75.9150], 
            [17.6530, 75.9220], [17.6480, 75.9280]
        ],
        color: '#F59E0B',
        reservoirLocation: [17.6600, 75.9120],
        valveLocations: [[17.6580, 75.9150], [17.6530, 75.9220]],
        population: 48000,
        connections: 9100
    },
    // Prabhag 4 - Central/Market Area
    { 
        id: 'prabhag-4', 
        name: "Prabhag 4 - Central Market", 
        wardNumbers: [13, 14, 15, 16],
        center: [17.6700, 75.9100],
        bounds: [
            [17.6780, 75.9000], [17.6780, 75.9200], 
            [17.6620, 75.9200], [17.6620, 75.9000]
        ],
        pipeline: [
            [17.6760, 75.9020], [17.6730, 75.9080], 
            [17.6690, 75.9140], [17.6650, 75.9180]
        ],
        color: '#8B5CF6',
        reservoirLocation: [17.6750, 75.9040],
        valveLocations: [[17.6730, 75.9080], [17.6690, 75.9140]],
        population: 62000,
        connections: 11500
    },
    // Prabhag 5 - Murarji Peth
    { 
        id: 'prabhag-5', 
        name: "Prabhag 5 - Murarji Peth", 
        wardNumbers: [17, 18, 19, 20],
        center: [17.6680, 75.8850],
        bounds: [
            [17.6780, 75.8700], [17.6780, 75.9000], 
            [17.6580, 75.9000], [17.6580, 75.8700]
        ],
        pipeline: [
            [17.6750, 75.8750], [17.6710, 75.8820], 
            [17.6670, 75.8890], [17.6620, 75.8950]
        ],
        color: '#EC4899',
        reservoirLocation: [17.6740, 75.8770],
        valveLocations: [[17.6710, 75.8820], [17.6670, 75.8890]],
        population: 55000,
        connections: 10200
    },
    // Prabhag 6 - Siddheshwar Area
    { 
        id: 'prabhag-6', 
        name: "Prabhag 6 - Siddheshwar", 
        wardNumbers: [21, 22, 23, 24],
        center: [17.6600, 75.9000],
        bounds: [
            [17.6700, 75.8900], [17.6700, 75.9100], 
            [17.6500, 75.9100], [17.6500, 75.8900]
        ],
        pipeline: [
            [17.6680, 75.8920], [17.6640, 75.8970], 
            [17.6590, 75.9030], [17.6540, 75.9080]
        ],
        color: '#06B6D4',
        reservoirLocation: [17.6670, 75.8940],
        valveLocations: [[17.6640, 75.8970], [17.6590, 75.9030]],
        population: 41000,
        connections: 7800
    },
    // Prabhag 7 - Railway Station Area (LIVE HUB)
    { 
        id: 'prabhag-7', 
        name: "Prabhag 7 - Railway Station", 
        wardNumbers: [25, 26, 27, 28],
        center: [17.6650, 75.9050],
        bounds: [
            [17.6720, 75.8980], [17.6720, 75.9120], 
            [17.6580, 75.9120], [17.6580, 75.8980]
        ],
        pipeline: [
            [17.6700, 75.9000], [17.6670, 75.9030], 
            [17.6630, 75.9060], [17.6600, 75.9100]
        ],
        color: '#EF4444',
        reservoirLocation: [17.6690, 75.9010],
        valveLocations: [[17.6670, 75.9030], [17.6630, 75.9060]],
        population: 58000,
        connections: 10800,
        isLiveHub: true
    },
    // Prabhag 8 - Degaon Area
    { 
        id: 'prabhag-8', 
        name: "Prabhag 8 - Degaon", 
        wardNumbers: [29, 30, 31, 32],
        center: [17.6480, 75.9100],
        bounds: [
            [17.6580, 75.9000], [17.6580, 75.9200], 
            [17.6380, 75.9200], [17.6380, 75.9000]
        ],
        pipeline: [
            [17.6550, 75.9020], [17.6510, 75.9070], 
            [17.6460, 75.9130], [17.6410, 75.9180]
        ],
        color: '#84CC16',
        reservoirLocation: [17.6540, 75.9040],
        valveLocations: [[17.6510, 75.9070], [17.6460, 75.9130]],
        population: 38000,
        connections: 7200
    },
    // Prabhag 9 - Kumatha Naka
    { 
        id: 'prabhag-9', 
        name: "Prabhag 9 - Kumatha Naka", 
        wardNumbers: [33, 34, 35, 36],
        center: [17.6750, 75.8750],
        bounds: [
            [17.6850, 75.8650], [17.6850, 75.8850], 
            [17.6650, 75.8850], [17.6650, 75.8650]
        ],
        pipeline: [
            [17.6820, 75.8680], [17.6780, 75.8730], 
            [17.6730, 75.8790], [17.6680, 75.8830]
        ],
        color: '#F97316',
        reservoirLocation: [17.6810, 75.8700],
        valveLocations: [[17.6780, 75.8730], [17.6730, 75.8790]],
        population: 43000,
        connections: 8100
    },
    // Prabhag 10 - Shelgi
    { 
        id: 'prabhag-10', 
        name: "Prabhag 10 - Shelgi", 
        wardNumbers: [37, 38, 39, 40],
        center: [17.6900, 75.8900],
        bounds: [
            [17.7000, 75.8800], [17.7000, 75.9000], 
            [17.6800, 75.9000], [17.6800, 75.8800]
        ],
        pipeline: [
            [17.6970, 75.8830], [17.6930, 75.8870], 
            [17.6880, 75.8920], [17.6830, 75.8970]
        ],
        color: '#14B8A6',
        reservoirLocation: [17.6960, 75.8850],
        valveLocations: [[17.6930, 75.8870], [17.6880, 75.8920]],
        population: 36000,
        connections: 6800
    },
    // Prabhag 11 - Soregaon
    { 
        id: 'prabhag-11', 
        name: "Prabhag 11 - Soregaon", 
        wardNumbers: [41, 42, 43, 44],
        center: [17.6400, 75.8950],
        bounds: [
            [17.6500, 75.8850], [17.6500, 75.9050], 
            [17.6300, 75.9050], [17.6300, 75.8850]
        ],
        pipeline: [
            [17.6470, 75.8880], [17.6430, 75.8920], 
            [17.6380, 75.8970], [17.6330, 75.9020]
        ],
        color: '#A855F7',
        reservoirLocation: [17.6460, 75.8900],
        valveLocations: [[17.6430, 75.8920], [17.6380, 75.8970]],
        population: 32000,
        connections: 6100
    },
    // Prabhag 12 - MIDC Area
    { 
        id: 'prabhag-12', 
        name: "Prabhag 12 - MIDC Industrial", 
        wardNumbers: [45, 46, 47, 48],
        center: [17.6350, 75.9300],
        bounds: [
            [17.6450, 75.9200], [17.6450, 75.9400], 
            [17.6250, 75.9400], [17.6250, 75.9200]
        ],
        pipeline: [
            [17.6420, 75.9230], [17.6380, 75.9270], 
            [17.6330, 75.9320], [17.6280, 75.9370]
        ],
        color: '#64748B',
        reservoirLocation: [17.6410, 75.9250],
        valveLocations: [[17.6380, 75.9270], [17.6330, 75.9320]],
        population: 28000,
        connections: 5200,
        isIndustrial: true
    }
];

// Main water sources and trunk lines for Solapur
const SOLAPUR_INFRASTRUCTURE = {
    mainSources: [
        { name: "Ujani Dam Supply", location: [17.7100, 75.9200], capacity: "450 MLD" },
        { name: "Ekruk WTP", location: [17.6950, 75.8800], capacity: "280 MLD" },
        { name: "Hipparga Lake", location: [17.6600, 75.8600], capacity: "120 MLD" }
    ],
    trunkMains: [
        {
            name: "Ujani Main Trunk",
            path: [[17.7100, 75.9200], [17.6950, 75.9100], [17.6800, 75.9050], [17.6700, 75.9000]],
            diameter: "1200mm"
        },
        {
            name: "Ekruk Distribution",
            path: [[17.6950, 75.8800], [17.6850, 75.8850], [17.6750, 75.8900], [17.6650, 75.9000]],
            diameter: "900mm"
        },
        {
            name: "Southern Ring",
            path: [[17.6600, 75.8600], [17.6500, 75.8800], [17.6400, 75.9000], [17.6350, 75.9200]],
            diameter: "800mm"
        }
    ],
    reservoirs: [
        { name: "Shelgi ESR", location: [17.6900, 75.8900], capacity: "5 ML" },
        { name: "Degaon ESR", location: [17.6450, 75.9100], capacity: "4 ML" },
        { name: "Central GSR", location: [17.6700, 75.9100], capacity: "8 ML" },
        { name: "Vijapur ESR", location: [17.6800, 75.9350], capacity: "6 ML" }
    ]
};

// Thresholds for alerts
const THRESHOLDS = {
    pressure: { low: 2.0, optimal: 3.5, high: 5.5, critical: 6.0 },
    flowRate: { low: 50, optimal: 100, high: 200, critical: 250 },
    waterQuality: { excellent: 50, good: 150, acceptable: 300, poor: 500 }
};

// Map View Controller Component
function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && zoom) {
            map.setView(center, zoom, { animate: true, duration: 0.5 });
        }
    }, [center, zoom, map]);
    return null;
}

// Custom Hook for ESP32 Real-time Data
function useESP32Data(prabhagId) {
    const [data, setData] = useState({
        flowRate: 0,
        pressure: 0,
        waterQuality: 0,
        temperature: 0,
        valveStatus: 'CLOSED',
        leakDetected: false,
        lastUpdate: null,
        connected: false
    });

    useEffect(() => {
        if (!prabhagId) return;

        const dataRef = ref(rtdb, `sensors/${prabhagId}`);
        
        const unsubscribe = onValue(dataRef, (snapshot) => {
            if (snapshot.exists()) {
                const sensorData = snapshot.val();
                setData({
                    flowRate: sensorData.flowRate || 0,
                    pressure: sensorData.pressure || 0,
                    waterQuality: sensorData.waterQuality || 0,
                    temperature: sensorData.temperature || 0,
                    valveStatus: sensorData.valveStatus || 'CLOSED',
                    leakDetected: sensorData.leakDetected || false,
                    lastUpdate: sensorData.timestamp ? new Date(sensorData.timestamp) : new Date(),
                    connected: true
                });
            } else {
                setData(prev => ({ ...prev, connected: false }));
            }
        }, (error) => {
            console.error("ESP32 Data Error:", error);
            setData(prev => ({ ...prev, connected: false }));
        });

        return () => off(dataRef);
    }, [prabhagId]);

    return data;
}

// Government Header Component
function GovHeader() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-gradient-to-r from-[#1a365d] via-[#2c5282] to-[#1a365d] text-white">
            {/* Top Government Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 py-1.5 text-center text-sm font-medium tracking-wide">
                <span>🇮🇳 Government of Maharashtra | महाराष्ट्र शासन | Solapur Municipal Corporation</span>
            </div>
            
            {/* Main Header */}
            <div className="py-3 px-8 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight">सोलापूर महानगरपालिका</h1>
                            <p className="text-xs text-white/70">Solapur Municipal Corporation</p>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div>
                        <p className="text-sm font-semibold">Smart Water Pressure Management System</p>
                        <p className="text-xs text-white/60">स्मार्ट पाणी दाब व्यवस्थापन प्रणाली</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                        <Clock size={16} />
                        <span className="font-mono">
                            {currentTime.toLocaleTimeString('en-IN', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true 
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1.5">
                            <Phone size={14} />
                            <span>1800-XXX-XXXX</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Mail size={14} />
                            <span>water@smc.gov.in</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status, size = 'md' }) {
    const configs = {
        online: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Online' },
        offline: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Offline' },
        warning: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Warning' },
        critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Critical' },
        balanced: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Balanced' },
        unbalanced: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Unbalanced' }
    };
    
    const config = configs[status.toLowerCase()] || configs.offline;
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    
    return (
        <span className={`${config.bg} ${config.text} ${sizeClasses} rounded-full font-semibold inline-flex items-center gap-1.5`}>
            <span className={`w-2 h-2 ${config.dot} rounded-full animate-pulse`} />
            {config.label}
        </span>
    );
}

// Metric Card Component
function MetricCard({ icon: Icon, label, value, unit, status, trend, color = 'blue' }) {
    const colorClasses = {
        blue: 'from-blue-50 to-blue-100 border-blue-200',
        green: 'from-green-50 to-green-100 border-green-200',
        amber: 'from-amber-50 to-amber-100 border-amber-200',
        red: 'from-red-50 to-red-100 border-red-200',
        cyan: 'from-cyan-50 to-cyan-100 border-cyan-200',
        purple: 'from-purple-50 to-purple-100 border-purple-200'
    };
    
    const iconColors = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        amber: 'text-amber-600',
        red: 'text-red-600',
        cyan: 'text-cyan-600',
        purple: 'text-purple-600'
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} p-5 rounded-2xl border-2 transition-all hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon size={20} className={iconColors[color]} />
                    <p className="text-sm font-bold text-slate-700 uppercase tracking-wide">{label}</p>
                </div>
                {trend && (
                    <span className={`text-xs font-semibold ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {trend > 0 ? <TrendingUp size={16} /> : trend < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                    </span>
                )}
            </div>
            <p className="text-3xl font-bold text-slate-800">
                {value}
                <span className="text-lg text-slate-500 ml-1">{unit}</span>
            </p>
            {status && (
                <div className="mt-3 pt-3 border-t border-slate-200/50">
                    <StatusBadge status={status} size="sm" />
                </div>
            )}
        </div>
    );
}

// Alert Banner Component
function AlertBanner({ type, message, action, onAction, onDismiss }) {
    const configs = {
        critical: { 
            bg: 'bg-red-50 border-red-200', 
            icon: AlertOctagon, 
            iconColor: 'text-red-600',
            textColor: 'text-red-800'
        },
        warning: { 
            bg: 'bg-amber-50 border-amber-200', 
            icon: AlertTriangle, 
            iconColor: 'text-amber-600',
            textColor: 'text-amber-800'
        },
        info: { 
            bg: 'bg-blue-50 border-blue-200', 
            icon: Info, 
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800'
        },
        success: { 
            bg: 'bg-green-50 border-green-200', 
            icon: CheckCircle2, 
            iconColor: 'text-green-600',
            textColor: 'text-green-800'
        }
    };
    
    const config = configs[type] || configs.info;
    const IconComponent = config.icon;

    return (
        <div className={`${config.bg} border-2 rounded-xl p-4 flex items-center justify-between animate-pulse`}>
            <div className="flex items-center gap-3">
                <IconComponent size={24} className={config.iconColor} />
                <p className={`text-sm font-semibold ${config.textColor}`}>{message}</p>
            </div>
            <div className="flex items-center gap-2">
                {action && (
                    <button 
                        onClick={onAction}
                        className="px-4 py-2 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200"
                    >
                        {action}
                    </button>
                )}
                {onDismiss && (
                    <button onClick={onDismiss} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                        <XCircle size={20} className="text-slate-400" />
                    </button>
                )}
            </div>
        </div>
    );
}

// Main Application Component
export default function EquiFlowPortal() {
    const MASTER_HEAD_EMAIL = "siddheshkite5760@gmail.com";

    // --- STATES ---
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('equiflow_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedZone, setSelectedZone] = useState(null);
    const [mapLayer, setMapLayer] = useState('satellite');
    const [showInfrastructure, setShowInfrastructure] = useState(true);
    
    // Auth states
    const [userEmail, setUserEmail] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isSending, setIsSending] = useState(false);
    
    // Data states
    const [whitelist, setWhitelist] = useState([]);
    const [firebaseLogs, setFirebaseLogs] = useState([]);
    const [newUser, setNewUser] = useState({ email: '', zone: SOLAPUR_WARDS[0].name, role: 'Inspector' });
    const [systemAlerts, setSystemAlerts] = useState([]);
    
    // Operator states
    const [valveStatus, setValveStatus] = useState('STOPPED');
    const [iotConnected, setIotConnected] = useState(false);
    const [iotConnecting, setIotConnecting] = useState(false);
    const [safeguardActive, setSafeguardActive] = useState(false);
    const [safeguardCountdown, setSafeguardCountdown] = useState(0);
    const [leakDetected, setLeakDetected] = useState(false);

    // Get operator's assigned zone data
    const operatorZone = useMemo(() => {
        if (currentUser?.role === 'OPERATOR' && currentUser?.zone) {
            return SOLAPUR_WARDS.find(w => w.name === currentUser.zone) || SOLAPUR_WARDS[0];
        }
        return null;
    }, [currentUser]);

    // ESP32 data for operator
    const esp32Data = useESP32Data(operatorZone?.id);

    // --- INITIALIZE EMAILJS ---
    useEffect(() => {
        emailjs.init("vjt5N7nphyJL-mhP");
    }, []);

    // --- DATA SYNC ---
    useEffect(() => {
        if (!currentUser) return;

        // Activity logs listener
        const logsQuery = query(
            collection(db, "activity_logs"), 
            orderBy("timestamp", "desc"),
            limit(100)
        );
        const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
            setFirebaseLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        // Users listener (for HEAD)
        let unsubUsers = () => {};
        if (currentUser.role === 'HEAD') {
            unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
                setWhitelist(snapshot.docs.map(d => ({ email: d.id, ...d.data() })));
            });
        }

        // System alerts listener
        const alertsQuery = query(
            collection(db, "system_alerts"),
            where("resolved", "==", false),
            orderBy("timestamp", "desc")
        );
        const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
            setSystemAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubLogs();
            unsubUsers();
            unsubAlerts();
        };
    }, [currentUser]);

    // --- LEAK DETECTION & AUTO-SAFEGUARD ---
    useEffect(() => {
        if (!esp32Data.connected || !iotConnected) return;

        // Check for leak detection from ESP32
        if (esp32Data.leakDetected && !leakDetected) {
            setLeakDetected(true);
            
            // Start safeguard countdown if valve is open
            if (valveStatus === 'STARTED' && !safeguardActive) {
                setSafeguardActive(true);
                setSafeguardCountdown(10);
                
                // Log leak detection
                logActivity('LEAK_DETECTED', `Leak detected! Auto-safeguard initiated. Valve will close in 10 seconds.`);
            }
        } else if (!esp32Data.leakDetected && leakDetected) {
            setLeakDetected(false);
        }
    }, [esp32Data.leakDetected, esp32Data.connected, iotConnected, valveStatus, safeguardActive, leakDetected]);

    // --- SAFEGUARD COUNTDOWN ---
    useEffect(() => {
        if (safeguardCountdown > 0) {
            const timer = setTimeout(() => {
                setSafeguardCountdown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (safeguardCountdown === 0 && safeguardActive) {
            // Auto-close valve
            handleValveAction('STOPPED', 'AUTO_SAFEGUARD: Valve closed automatically due to leak detection');
            setSafeguardActive(false);
        }
    }, [safeguardCountdown, safeguardActive]);

    // --- ACTIVITY LOGGER ---
    const logActivity = async (action, description) => {
        try {
            await addDoc(collection(db, "activity_logs"), {
                user: currentUser?.email || 'SYSTEM',
                role: currentUser?.role || 'SYSTEM',
                zone: currentUser?.zone || 'N/A',
                action: action,
                description: description,
                timestamp: serverTimestamp(),
                timeStr: new Date().toLocaleString('en-IN')
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    // --- AUTH HANDLERS ---
    const handleLogin = async (e) => {
        e.preventDefault();
        if (isSending) return;

        try {
            setIsSending(true);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);

            const response = await emailjs.send(
                "service_u7gokr6",
                "template_77fpnrt",
                { to_email: userEmail, otp_code: otp },
                "vjt5N7npAhyJL-mhP"
            );

            if (response.status === 200) {
                setShowOtpInput(true);
            }
        } catch (error) {
            console.error("OTP Send Error:", error);
            alert(`Failed to send OTP: ${error.text || "Check EmailJS configuration"}`);
        } finally {
            setIsSending(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        if (otpInput !== generatedOtp) {
            alert("Invalid OTP code.");
            return;
        }

        const emailLower = userEmail.toLowerCase().trim();

        if (emailLower === MASTER_HEAD_EMAIL.toLowerCase()) {
            const userData = { role: 'HEAD', email: emailLower };
            localStorage.setItem('equiflow_user', JSON.stringify(userData));
            setCurrentUser(userData);
            await logActivity('LOGIN', 'HEAD administrator logged in');
        } else {
            const userDoc = await getDoc(doc(db, "users", emailLower));
            if (userDoc.exists()) {
                const data = userDoc.data();
                const userData = { 
                    role: 'OPERATOR', 
                    email: emailLower, 
                    zone: data.assignedZone,
                    operatorRole: data.role 
                };
                localStorage.setItem('equiflow_user', JSON.stringify(userData));
                setCurrentUser(userData);
                await logActivity('LOGIN', `Operator logged in for ${data.assignedZone}`);
            } else {
                alert("Unauthorized: This email is not mapped to any zone.");
            }
        }
    };

    const handleLogout = async () => {
        await logActivity('LOGOUT', `${currentUser.role} logged out`);
        localStorage.removeItem('equiflow_user');
        setCurrentUser(null);
        window.location.reload();
    };

    // --- WHITELIST HANDLERS ---
    const addPersonnel = async (e) => {
        e.preventDefault();
        const emailLower = newUser.email.toLowerCase().trim();
        
        await setDoc(doc(db, "users", emailLower), {
            assignedZone: newUser.zone,
            role: newUser.role,
            addedAt: serverTimestamp(),
            addedBy: currentUser.email
        });
        
        await logActivity('USER_MAPPED', `Mapped ${emailLower} to ${newUser.zone} as ${newUser.role}`);
        setNewUser({ ...newUser, email: '' });
    };

    const removePersonnel = async (email) => {
        await deleteDoc(doc(db, "users", email));
        await logActivity('USER_REMOVED', `Removed ${email} from whitelist`);
    };

    // --- IoT CONNECTION ---
    const handleIoTConnect = async () => {
        setIotConnecting(true);
        
        try {
            await logActivity('IOT_CONNECTING', 'Initiating IoT device connection...');
            
            // Set connection request in Firebase RTDB
            await set(ref(rtdb, `commands/${operatorZone.id}/connect`), {
                requested: true,
                timestamp: Date.now(),
                operator: currentUser.email
            });

            // Simulate connection delay (in production, wait for ESP32 acknowledgment)
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            setIotConnected(true);
            await logActivity('IOT_CONNECTED', 'IoT device connected successfully');
        } catch (error) {
            console.error("IoT Connection Error:", error);
            alert("Failed to connect to IoT device.");
        } finally {
            setIotConnecting(false);
        }
    };

    const handleIoTDisconnect = async () => {
        // Send disconnect command
        await set(ref(rtdb, `commands/${operatorZone.id}/connect`), {
            requested: false,
            timestamp: Date.now()
        });
        
        setIotConnected(false);
        setValveStatus('STOPPED');
        setSafeguardActive(false);
        setSafeguardCountdown(0);
        
        await logActivity('IOT_DISCONNECTED', 'IoT device disconnected');
    };

    // --- VALVE CONTROL ---
    const handleValveAction = async (status, description) => {
        if (!iotConnected && status !== 'STOPPED') {
            alert("Connect to IoT device first.");
            return;
        }

        // Send command to ESP32 via Firebase RTDB
        await set(ref(rtdb, `commands/${operatorZone.id}/valve`), {
            status: status,
            timestamp: Date.now(),
            operator: currentUser.email
        });

        setValveStatus(status);
        
        // Cancel safeguard if manually stopped
        if (status === 'STOPPED') {
            setSafeguardActive(false);
            setSafeguardCountdown(0);
        }

        await logActivity(`VALVE_${status}`, description);
    };

    const cancelSafeguard = () => {
        setSafeguardActive(false);
        setSafeguardCountdown(0);
        logActivity('SAFEGUARD_CANCELLED', 'Operator manually cancelled auto-safeguard');
    };

    // --- MAP TILE URLS ---
    const mapTiles = {
        satellite: "[server.arcgisonline.com](https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x})",
        street: "[{s}.tile.openstreetmap.org](https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png)",
        terrain: "[server.arcgisonline.com](https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x})",
        dark: "[{s}.basemaps.cartocdn.com](https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png)"
    };

    // =====================================================
    // RENDER: LOGIN SCREEN
    // =====================================================
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col">
                {/* Government Banner */}
                <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white py-2 text-center text-sm font-semibold tracking-wide">
                    🇮🇳 Government of Maharashtra | महाराष्ट्र शासन
                </div>
                
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] p-10 text-center text-white">
                            <div className="flex items-center justify-center gap-4 mb-6">
                                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                                    <Building2 size={40} />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">Solapur Municipal Corporation</h1>
                            <p className="text-white/80 text-lg">सोलापूर महानगरपालिका</p>
                            <div className="mt-6 pt-6 border-t border-white/20">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Droplets size={24} className="text-cyan-300" />
                                    <p className="text-xl font-bold">EquiFlow SWPMS</p>
                                </div>
                                <p className="text-white/70 text-sm">Smart Water Pressure Management System</p>
                                <p className="text-white/50 text-xs mt-1">स्मार्ट पाणी दाब व्यवस्थापन प्रणाली</p>
                            </div>
                        </div>

                        {/* Login Form */}
                        <div className="p-10">
                            <div className="flex items-center gap-3 mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <ShieldCheck size={24} className="text-blue-600" />
                                <div>
                                    <p className="text-base font-semibold text-blue-800">Secure OTP Authentication</p>
                                    <p className="text-sm text-blue-600">Only authorized personnel can access</p>
                                </div>
                            </div>
                            
                            {!showOtpInput ? (
                                <form onSubmit={handleLogin} className="space-y-6">
                                    <div>
                                        <label className="block text-base font-bold text-slate-700 mb-3">
                                            Official Email Address
                                        </label>
                                        <input 
                                            type="email" 
                                            placeholder="Enter your registered email" 
                                            value={userEmail} 
                                            onChange={e => setUserEmail(e.target.value)} 
                                            className="w-full p-5 text-lg bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:bg-white outline-none font-medium transition-all" 
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={isSending}
                                        className="w-full bg-gradient-to-r from-[#1a365d] to-[#2c5282] text-white font-bold py-5 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {isSending ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                <Mail size={24} />
                                                Request OTP
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={verifyOtp} className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} className="text-green-600" />
                                        </div>
                                        <p className="text-base text-slate-600">OTP sent to</p>
                                        <p className="font-bold text-lg text-slate-800">{userEmail}</p>
                                    </div>
                                    <div>
                                        <label className="block text-base font-bold text-slate-700 mb-3">
                                            Enter 6-Digit OTP
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="• • • • • •" 
                                            value={otpInput} 
                                            onChange={e => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                                            maxLength={6}
                                            className="w-full p-5 bg-slate-50 rounded-2xl text-center text-3xl font-mono tracking-[0.75em] outline-none border-2 border-green-400 focus:border-green-500 focus:bg-white transition-all" 
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="w-full bg-green-600 text-white font-bold py-5 text-lg rounded-2xl shadow-xl hover:bg-green-700 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ShieldCheck size={24} />
                                        Verify & Login
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { setShowOtpInput(false); setOtpInput(''); }} 
                                        className="w-full text-base font-medium text-slate-500 hover:text-slate-700 transition-colors py-2"
                                    >
                                        ← Change Email Address
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-5 text-center border-t">
                            <p className="text-sm text-slate-500">
                                For technical support: <strong>1800-XXX-XXXX</strong> | water@smc.gov.in
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="bg-slate-800 text-white/60 py-4 text-center text-sm">
                    © 2024 Solapur Municipal Corporation. All Rights Reserved.
                </div>
            </div>
        );
    }

    // =====================================================
    // RENDER: OPERATOR INTERFACE
    // =====================================================
    if (currentUser.role === 'OPERATOR') {
        const zone = operatorZone;
        
        // Calculate health status based on ESP32 data
        const getHealthStatus = () => {
            if (!esp32Data.connected) return 'offline';
            if (esp32Data.leakDetected) return 'critical';
            if (esp32Data.pressure < THRESHOLDS.pressure.low || esp32Data.pressure > THRESHOLDS.pressure.high) return 'warning';
            return 'balanced';
        };

        const getWaterQualityStatus = () => {
            const ppm = esp32Data.waterQuality;
            if (ppm <= THRESHOLDS.waterQuality.excellent) return { label: 'Excellent', color: 'green' };
            if (ppm <= THRESHOLDS.waterQuality.good) return { label: 'Good', color: 'green' };
            if (ppm <= THRESHOLDS.waterQuality.acceptable) return { label: 'Acceptable', color: 'amber' };
            return { label: 'Poor', color: 'red' };
        };

        return (
            <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
                <GovHeader />
                
                <main className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                    {/* Critical Alert Banner */}
                    {(leakDetected || safeguardActive) && (
                        <AlertBanner 
                            type="critical"
                            message={safeguardActive 
                                ? `⚠️ LEAK DETECTED! Auto-safeguard will close valve in ${safeguardCountdown} seconds` 
                                : "⚠️ LEAK DETECTED in your zone! Take immediate action!"
                            }
                            action={safeguardActive ? "Cancel Safeguard" : undefined}
                            onAction={safeguardActive ? cancelSafeguard : undefined}
                        />
                    )}

                    {/* Header */}
                    <header className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border-l-4 border-blue-600">
                        <div className="flex items-center gap-5">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl text-white shadow-lg">
                                <Radio size={32}/>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Field Operator Terminal</h1>
                                <p className="text-base text-slate-500 flex items-center gap-2 mt-1">
                                    <span className={`w-2.5 h-2.5 rounded-full ${iotConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                                    {currentUser.email}
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-400">{currentUser.operatorRole || 'Inspector'}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right bg-gradient-to-r from-blue-50 to-blue-100 px-8 py-4 rounded-2xl border-2 border-blue-200">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Assigned Zone</p>
                                <p className="font-bold text-xl text-slate-800 mt-1">{zone?.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Wards: {zone?.wardNumbers?.join(', ')}</p>
                            </div>
                            <button 
                                onClick={handleLogout} 
                                className="bg-red-50 p-4 rounded-2xl text-red-500 hover:bg-red-100 transition-colors border-2 border-red-100"
                            >
                                <LogOut size={24}/>
                            </button>
                        </div>
                    </header>

                    {/* Main Grid */}
                    <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                        {/* Map Section */}
                        <div className="col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            {/* Map Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MapIcon size={20} className="text-blue-600" />
                                    <span className="font-bold text-slate-800">Zone Map - {zone?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select 
                                        value={mapLayer}
                                        onChange={(e) => setMapLayer(e.target.value)}
                                        className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium"
                                    >
                                        <option value="satellite">Satellite</option>
                                        <option value="street">Street</option>
                                        <option value="terrain">Terrain</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Map Container */}
                            <div className="flex-1 relative">
                                <MapContainer 
                                    center={zone?.center || [17.67, 75.90]} 
                                    zoom={15} 
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                >
                                    <ChangeView center={zone?.center} zoom={15} />
                                    <TileLayer url={mapTiles[mapLayer]} />
                                    
                                    {/* Zone Boundary */}
                                    {zone?.bounds && (
                                        <Polygon 
                                            positions={zone.bounds} 
                                            pathOptions={{ 
                                                color: zone.color, 
                                                weight: 4, 
                                                fillOpacity: 0.15,
                                                dashArray: '10, 5'
                                            }} 
                                        />
                                    )}
                                    
                                    {/* Pipeline */}
                                    {zone?.pipeline && (
                                        <Polyline 
                                            positions={zone.pipeline} 
                                            pathOptions={{ 
                                                color: valveStatus === 'STARTED' ? '#0ea5e9' : '#94a3b8', 
                                                weight: 8,
                                                opacity: 0.8
                                            }} 
                                        />
                                    )}
                                    
                                    {/* Valve Locations */}
                                    {zone?.valveLocations?.map((loc, idx) => (
                                        <CircleMarker 
                                            key={idx}
                                            center={loc}
                                            radius={12}
                                            pathOptions={{
                                                color: valveStatus === 'STARTED' ? '#22c55e' : '#ef4444',
                                                fillColor: valveStatus === 'STARTED' ? '#22c55e' : '#ef4444',
                                                fillOpacity: 0.8
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <p className="font-bold">Valve {idx + 1}</p>
                                                    <p className={`font-semibold ${valveStatus === 'STARTED' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {valveStatus}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    ))}
                                    
                                    {/* Reservoir */}
                                    {zone?.reservoirLocation && (
                                        <Marker position={zone.reservoirLocation}>
                                            <Popup>
                                                <div className="text-center">
                                                    <p className="font-bold">Zone Reservoir</p>
                                                    <p className="text-sm text-slate-500">{zone.name}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}
                                </MapContainer>

                                {/* Map Overlay Info */}
                                <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-200">
                                    <p className="text-sm font-bold text-slate-800">{zone?.name}</p>
                                    <p className="text-xs text-slate-500">
                                        Lat: {zone?.center[0].toFixed(4)}, Lng: {zone?.center[1].toFixed(4)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <StatusBadge status={getHealthStatus()} size="sm" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="col-span-4 flex flex-col gap-5 overflow-y-auto">
                            {/* IoT Connection */}
                            <div className={`p-6 rounded-2xl shadow-sm border-2 transition-all ${iotConnected ? 'bg-green-50 border-green-300' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                        <Signal size={20} className={iotConnected ? 'text-green-600' : 'text-slate-400'} />
                                        IoT Device
                                    </h3>
                                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${iotConnected ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {iotConnected ? 'CONNECTED' : 'OFFLINE'}
                                    </span>
                                </div>
                                
                                {!iotConnected ? (
                                    <button 
                                        onClick={handleIoTConnect}
                                        disabled={iotConnecting}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {iotConnecting ? (
                                            <>
                                                <Loader2 size={24} className="animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            <>
                                                <Wifi size={24} />
                                                Connect to IoT
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                                            <span className="text-sm text-slate-600">Last Update</span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {esp32Data.lastUpdate?.toLocaleTimeString() || 'N/A'}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={handleIoTDisconnect}
                                            className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl border-2 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <WifiOff size={20} />
                                            Disconnect
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Live Telemetry */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Activity size={20} className="text-blue-600" />
                                    Live Telemetry
                                    {!esp32Data.connected && (
                                        <span className="text-xs font-normal text-slate-400 ml-auto">Awaiting data...</span>
                                    )}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <MetricCard 
                                        icon={Gauge}
                                        label="Pressure"
                                        value={esp32Data.pressure.toFixed(1)}
                                        unit="Bar"
                                        color="blue"
                                        status={esp32Data.pressure < THRESHOLDS.pressure.low ? 'warning' : 
                                               esp32Data.pressure > THRESHOLDS.pressure.high ? 'critical' : 'balanced'}
                                    />
                                    <MetricCard 
                                        icon={Waves}
                                        label="Flow Rate"
                                        value={esp32Data.flowRate.toFixed(0)}
                                        unit="mL/s"
                                        color="cyan"
                                    />
                                    <MetricCard 
                                        icon={Beaker}
                                        label="Quality"
                                        value={esp32Data.waterQuality.toFixed(0)}
                                        unit="PPM"
                                        color={getWaterQualityStatus().color}
                                        status={getWaterQualityStatus().label.toLowerCase()}
                                    />
                                    <MetricCard 
                                        icon={ThermometerSun}
                                        label="Temp"
                                        value={esp32Data.temperature.toFixed(1)}
                                        unit="°C"
                                        color="amber"
                                    />
                                </div>
                            </div>

                            {/* Valve Controls */}
                            <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col ${!iotConnected ? 'opacity-60' : ''}`}>
                                <h3 className="text-base font-bold text-slate-700 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Zap size={20} className="text-amber-600" />
                                    Valve Control
                                </h3>
                                
                                {!iotConnected && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-amber-800">Connect to IoT device to enable controls.</p>
                                    </div>
                                )}

                                <div className="space-y-4 flex-1 flex flex-col justify-center">
                                    {/* Start Button */}
                                    <button 
                                        onClick={() => handleValveAction('STARTED', 'Started water flow')}
                                        disabled={!iotConnected || safeguardActive}
                                        className={`p-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                            valveStatus === 'STARTED' 
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-[1.02]' 
                                                : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600'
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                        <Play size={28} />
                                        START FLOW
                                    </button>
                                    
                                    {/* Stop Button */}
                                    <button 
                                        onClick={() => handleValveAction('STOPPED', 'Stopped water flow')}
                                        disabled={!iotConnected}
                                        className={`p-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                            valveStatus === 'STOPPED' 
                                                ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-[1.02]' 
                                                : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600'
                                        } disabled:cursor-not-allowed disabled:opacity-50`}
                                    >
                                        <Square size={28} />
                                        STOP FLOW
                                    </button>
                                    
                                    {/* Safeguard Status */}
                                    {safeguardActive && (
                                        <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 animate-pulse">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Siren size={24} className="text-red-600" />
                                                    <span className="font-bold text-red-800 text-lg">AUTO-SAFEGUARD</span>
                                                </div>
                                                <span className="bg-red-600 text-white px-4 py-2 rounded-full text-xl font-mono font-bold">
                                                    {safeguardCountdown}s
                                                </span>
                                            </div>
                                            <p className="text-sm text-red-700 mb-3">
                                                Leak detected! Valve will auto-close in {safeguardCountdown} seconds.
                                            </p>
                                            <button 
                                                onClick={cancelSafeguard}
                                                className="w-full bg-white text-red-600 font-bold py-3 rounded-lg border-2 border-red-300 hover:bg-red-100 transition-colors"
                                            >
                                                Cancel Auto-Safeguard
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-slate-800 text-white/60 py-4 text-center text-sm">
                    © 2024 Solapur Municipal Corporation - Water Supply Department
                </footer>
            </div>
        );
    }

    // =====================================================
    // RENDER: HEAD OFFICE INTERFACE
    // =====================================================
    return (
        <div className="min-h-screen bg-slate-100 font-sans flex flex-col">
            <GovHeader />
            
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 bg-gradient-to-b from-[#0F172A] to-[#1e293b] text-white flex flex-col shrink-0 shadow-2xl">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl shadow-lg">
                                <Droplets size={28}/>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">EquiFlow</h2>
                                <span className="text-sm text-blue-400 font-medium">Head Office Console</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Main Navigation</p>
                        
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: 'Live Dashboard' },
                            { id: 'gis', icon: MapIcon, label: 'GIS Infrastructure Map' },
                            { id: 'whitelist', icon: Users, label: 'Personnel Mapping' },
                            { id: 'logs', icon: Database, label: 'Audit Trails' },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setSelectedZone(null); }} 
                                className={`w-full flex items-center gap-3 p-4 rounded-xl font-semibold text-base transition-all ${
                                    activeTab === item.id 
                                        ? 'bg-blue-600 text-white shadow-lg' 
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <item.icon size={22}/> {item.label}
                            </button>
                        ))}

                        <div className="h-px bg-white/10 my-4" />
                        
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-4 mb-3">Quick Stats</p>
                        
                        <div className="bg-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Total Prabhags</span>
                                <span className="text-lg font-bold text-white">{SOLAPUR_WARDS.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Active Operators</span>
                                <span className="text-lg font-bold text-green-400">{whitelist.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-400">Active Alerts</span>
                                <span className="text-lg font-bold text-amber-400">{systemAlerts.length}</span>
                            </div>
                        </div>
                    </nav>

                    {/* User Info */}
                    <div className="p-4 border-t border-white/10">
                        <div className="bg-white/5 rounded-xl p-4 mb-4">
                            <p className="text-xs text-slate-400 mb-1">Logged in as</p>
                            <p className="text-base font-semibold text-white truncate">{currentUser.email}</p>
                            <p className="text-sm text-blue-400 font-medium">HEAD ADMINISTRATOR</p>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-400 rounded-xl font-semibold text-base hover:bg-red-500 hover:text-white transition-all"
                        >
                            <LogOut size={20}/> Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header Bar */}
                    <header className="h-20 bg-white border-b px-8 flex items-center justify-between shrink-0 shadow-sm">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">
                                {selectedZone ? `Zone: ${selectedZone.name}` : 
                                 activeTab === 'whitelist' ? 'Personnel Mapping' :
                                 activeTab === 'dashboard' ? 'Citywide Dashboard' :
                                 activeTab === 'gis' ? 'GIS Infrastructure Map' : 'System Audit Trails'}
                            </h2>
                            <p className="text-sm text-slate-500">Smart Water Pressure Management System - Solapur</p>
                        </div>
                        <div className="flex gap-4 items-center">
                            {systemAlerts.length > 0 && (
                                <div className="px-4 py-2 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2 animate-pulse">
                                    <Bell size={18} className="text-red-600" />
                                    <span className="text-sm font-semibold text-red-700">{systemAlerts.length} Active Alerts</span>
                                </div>
                            )}
                            <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-semibold text-green-700">Systems Operational</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <span className="text-sm font-medium text-slate-600">
                                    {new Date().toLocaleDateString('en-IN', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-8">
                        
                        {/* ========== DASHBOARD TAB ========== */}
                        {activeTab === 'dashboard' && !selectedZone && (
                            <div className="space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <Box size={28} className="opacity-80" />
                                            <span className="text-3xl font-bold">{SOLAPUR_WARDS.length}</span>
                                        </div>
                                        <p className="text-lg font-semibold">Total Prabhags</p>
                                        <p className="text-sm opacity-80">Active monitoring zones</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <Users size={28} className="opacity-80" />
                                            <span className="text-3xl font-bold">{whitelist.length}</span>
                                        </div>
                                        <p className="text-lg font-semibold">Field Operators</p>
                                        <p className="text-sm opacity-80">Assigned personnel</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <Droplet size={28} className="opacity-80" />
                                            <span className="text-3xl font-bold">
                                                {SOLAPUR_WARDS.reduce((sum, w) => sum + w.connections, 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold">Total Connections</p>
                                        <p className="text-sm opacity-80">Water supply points</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <AlertTriangle size={28} className="opacity-80" />
                                            <span className="text-3xl font-bold">{systemAlerts.length}</span>
                                        </div>
                                        <p className="text-lg font-semibold">Active Alerts</p>
                                        <p className="text-sm opacity-80">Requiring attention</p>
                                    </div>
                                </div>

                                {/* Zone Grid */}
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-slate-800">All Prabhags Overview</h3>
                                        <p className="text-sm text-slate-500">Click any zone to view details</p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-5">
                                        {SOLAPUR_WARDS.map(zone => (
                                            <button 
                                                key={zone.id}
                                                onClick={() => setSelectedZone(zone)}
                                                className="bg-white p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-lg transition-all text-left group"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div 
                                                        className="p-3 rounded-xl transition-colors"
                                                        style={{ backgroundColor: `${zone.color}20`, color: zone.color }}
                                                    >
                                                        <Box size={24}/>
                                                    </div>
                                                    {zone.isLiveHub && (
                                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                                                            LIVE
                                                        </span>
                                                    )}
                                                    {zone.isIndustrial && (
                                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">
                                                            INDUSTRIAL
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-base font-bold text-slate-800 mb-1 line-clamp-1">{zone.name}</h4>
                                                <p className="text-xs text-slate-400 mb-3">Wards: {zone.wardNumbers.join(', ')}</p>
                                                <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                                                    <div>
                                                        <p className="text-xs text-slate-400">Population</p>
                                                        <p className="font-bold text-slate-700">{(zone.population/1000).toFixed(0)}K</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-400">Connections</p>
                                                        <p className="font-bold text-slate-700">{(zone.connections/1000).toFixed(1)}K</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========== SELECTED ZONE VIEW ========== */}
                        {activeTab === 'dashboard' && selectedZone && (
                            <div className="space-y-6">
                                <button 
                                    onClick={() => setSelectedZone(null)} 
                                    className="flex items-center gap-2 text-blue-600 font-semibold text-base bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-all"
                                >
                                    ← Back to All Zones
                                </button>
                                
                                <div className="grid grid-cols-12 gap-6">
                                    {/* Zone Info */}
                                    <div className="col-span-4 space-y-5">
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <div 
                                                className="w-full h-3 rounded-full mb-6"
                                                style={{ backgroundColor: selectedZone.color }}
                                            />
                                            <h3 className="text-xl font-bold text-slate-800 mb-1">{selectedZone.name}</h3>
                                            <p className="text-sm text-slate-500 mb-4">Wards: {selectedZone.wardNumbers.join(', ')}</p>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Population</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedZone.population.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-slate-50 p-4 rounded-xl">
                                                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Connections</p>
                                                    <p className="text-xl font-bold text-slate-800">{selectedZone.connections.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                                                <div className="flex items-start gap-3">
                                                    <Eye size={20} className="text-amber-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-800">View-Only Mode</p>
                                                        <p className="text-xs text-amber-700 mt-1">
                                                            Valve controls are managed by field operators. Real-time data shown when IoT is connected.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assigned Operator */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                            <h4 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                                                <Users size={18} className="text-blue-600" />
                                                Assigned Personnel
                                            </h4>
                                            {whitelist.filter(u => u.assignedZone === selectedZone.name).length === 0 ? (
                                                <p className="text-sm text-slate-400 text-center py-4">No operators assigned</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {whitelist.filter(u => u.assignedZone === selectedZone.name).map(u => (
                                                        <div key={u.email} className="p-3 bg-slate-50 rounded-xl flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                                {u.email[0].toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-slate-800 truncate">{u.email}</p>
                                                                <p className="text-xs text-slate-400">{u.role}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Map */}
                                    <div className="col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '600px' }}>
                                        <MapContainer 
                                            center={selectedZone.center} 
                                            zoom={15} 
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <ChangeView center={selectedZone.center} zoom={15} />
                                            <TileLayer url={mapTiles[mapLayer]} />
                                            
                                            <Polygon 
                                                positions={selectedZone.bounds} 
                                                pathOptions={{ 
                                                    color: selectedZone.color, 
                                                    weight: 4, 
                                                    fillOpacity: 0.15 
                                                }} 
                                            />
                                            
                                            <Polyline 
                                                positions={selectedZone.pipeline} 
                                                pathOptions={{ 
                                                    color: '#0ea5e9', 
                                                    weight: 6 
                                                }} 
                                            />
                                            
                                            {selectedZone.valveLocations?.map((loc, idx) => (
                                                <CircleMarker 
                                                    key={idx}
                                                    center={loc}
                                                    radius={10}
                                                    pathOptions={{
                                                        color: '#22c55e',
                                                        fillColor: '#22c55e',
                                                        fillOpacity: 0.8
                                                    }}
                                                >
                                                    <Popup>Valve Point {idx + 1}</Popup>
                                                </CircleMarker>
                                            ))}
                                            
                                            <Marker position={selectedZone.center}>
                                                <Popup><strong>{selectedZone.name}</strong></Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========== GIS MAP TAB ========== */}
                        {activeTab === 'gis' && (
                            <div className="space-y-6">
                                {/* Map Controls */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-xl font-bold text-slate-800">Complete Infrastructure Map</h3>
                                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                            {['satellite', 'street', 'terrain', 'dark'].map(layer => (
                                                <button
                                                    key={layer}
                                                    onClick={() => setMapLayer(layer)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                                        mapLayer === layer 
                                                            ? 'bg-white shadow-sm text-blue-600' 
                                                            : 'text-slate-600 hover:text-slate-800'
                                                    }`}
                                                >
                                                    {layer}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={showInfrastructure}
                                                onChange={(e) => setShowInfrastructure(e.target.checked)}
                                                className="w-4 h-4 rounded text-blue-600"
                                            />
                                            <span className="text-sm font-medium text-slate-600">Show Infrastructure</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Full Map */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '700px' }}>
                                    <MapContainer 
                                        center={[17.6700, 75.9050]} 
                                        zoom={13} 
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url={mapTiles[mapLayer]} />
                                        
                                        {/* All Zone Boundaries */}
                                        {SOLAPUR_WARDS.map(zone => (
                                            <React.Fragment key={zone.id}>
                                                <Polygon 
                                                    positions={zone.bounds} 
                                                    pathOptions={{ 
                                                        color: zone.color, 
                                                        weight: 2, 
                                                        fillOpacity: 0.1 
                                                    }}
                                                    eventHandlers={{
                                                        click: () => {
                                                            setSelectedZone(zone);
                                                            setActiveTab('dashboard');
                                                        }
                                                    }}
                                                >
                                                    <Popup>
                                                        <div className="text-center">
                                                            <p className="font-bold">{zone.name}</p>
                                                            <p className="text-sm text-slate-500">Click to view details</p>
                                                        </div>
                                                    </Popup>
                                                </Polygon>
                                                
                                                {showInfrastructure && (
                                                    <Polyline 
                                                        positions={zone.pipeline} 
                                                        pathOptions={{ 
                                                            color: zone.color, 
                                                            weight: 4,
                                                            opacity: 0.7
                                                        }} 
                                                    />
                                                )}
                                            </React.Fragment>
                                        ))}
                                        
                                        {/* Infrastructure */}
                                        {showInfrastructure && (
                                            <>
                                                {/* Trunk Mains */}
                                                {SOLAPUR_INFRASTRUCTURE.trunkMains.map((trunk, idx) => (
                                                    <Polyline 
                                                        key={idx}
                                                        positions={trunk.path} 
                                                        pathOptions={{ 
                                                            color: '#1e40af', 
                                                            weight: 8,
                                                            opacity: 0.9
                                                        }}
                                                    >
                                                        <Popup>
                                                            <div>
                                                                <p className="font-bold">{trunk.name}</p>
                                                                <p className="text-sm">Diameter: {trunk.diameter}</p>
                                                            </div>
                                                        </Popup>
                                                    </Polyline>
                                                ))}
                                                
                                                {/* Water Sources */}
                                                {SOLAPUR_INFRASTRUCTURE.mainSources.map((source, idx) => (
                                                    <CircleMarker 
                                                        key={idx}
                                                        center={source.location}
                                                        radius={15}
                                                        pathOptions={{
                                                            color: '#0369a1',
                                                            fillColor: '#0ea5e9',
                                                            fillOpacity: 0.9
                                                        }}
                                                    >
                                                        <Popup>
                                                            <div>
                                                                <p className="font-bold">{source.name}</p>
                                                                <p className="text-sm">Capacity: {source.capacity}</p>
                                                            </div>
                                                        </Popup>
                                                    </CircleMarker>
                                                ))}
                                                
                                                {/* Reservoirs */}
                                                {SOLAPUR_INFRASTRUCTURE.reservoirs.map((reservoir, idx) => (
                                                    <CircleMarker 
                                                        key={idx}
                                                        center={reservoir.location}
                                                        radius={10}
                                                        pathOptions={{
                                                            color: '#7c3aed',
                                                            fillColor: '#a78bfa',
                                                            fillOpacity: 0.9
                                                        }}
                                                    >
                                                        <Popup>
                                                            <div>
                                                                <p className="font-bold">{reservoir.name}</p>
                                                                <p className="text-sm">Capacity: {reservoir.capacity}</p>
                                                            </div>
                                                        </Popup>
                                                    </CircleMarker>
                                                ))}
                                            </>
                                        )}
                                    </MapContainer>
                                </div>

                                {/* Legend */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h4 className="text-base font-bold text-slate-700 mb-4">Map Legend</h4>
                                    <div className="flex flex-wrap gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-sky-500" />
                                            <span className="text-sm text-slate-600">Water Source</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full bg-violet-400" />
                                            <span className="text-sm text-slate-600">Reservoir/ESR</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-2 rounded bg-blue-800" />
                                            <span className="text-sm text-slate-600">Trunk Main</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-1 rounded bg-cyan-500" />
                                            <span className="text-sm text-slate-600">Distribution Pipeline</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-slate-400 rounded" />
                                            <span className="text-sm text-slate-600">Zone Boundary</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========== PERSONNEL MAPPING TAB ========== */}
                        {activeTab === 'whitelist' && (
                            <div className="grid grid-cols-12 gap-8">
                                {/* Add Form */}
                                <div className="col-span-5 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-blue-100 p-3 rounded-xl">
                                            <UserPlus size={24} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">Assign Personnel</h3>
                                            <p className="text-sm text-slate-500">Map operators to zones</p>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={addPersonnel} className="space-y-5">
                                        <div>
                                            <label className="block text-base font-semibold text-slate-700 mb-2">Official Email</label>
                                            <input 
                                                type="email" 
                                                placeholder="operator@example.com" 
                                                value={newUser.email} 
                                                onChange={e => setNewUser({...newUser, email: e.target.value})} 
                                                className="w-full p-4 text-base bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:bg-white outline-none font-medium transition-all" 
                                                required 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-base font-semibold text-slate-700 mb-2">Zone Assignment</label>
                                            <select 
                                                value={newUser.zone} 
                                                onChange={e => setNewUser({...newUser, zone: e.target.value})} 
                                                className="w-full p-4 text-base bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            >
                                                {SOLAPUR_WARDS.map(z => (
                                                    <option key={z.id} value={z.name}>{z.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-base font-semibold text-slate-700 mb-2">Role</label>
                                            <select 
                                                value={newUser.role} 
                                                onChange={e => setNewUser({...newUser, role: e.target.value})} 
                                                className="w-full p-4 text-base bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-blue-500 outline-none font-medium"
                                            >
                                                <option value="Inspector">Field Inspector</option>
                                                <option value="Supervisor">Zone Supervisor</option>
                                                <option value="Technician">Maintenance Technician</option>
                                            </select>
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                        >
                                            <UserPlus size={22}/> Add Personnel
                                        </button>
                                    </form>
                                </div>

                                {/* Whitelist */}
                                <div className="col-span-7 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-100 p-3 rounded-xl">
                                                <Users size={24} className="text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">Active Whitelist</h3>
                                                <p className="text-sm text-slate-500">Authorized field operators</p>
                                            </div>
                                        </div>
                                        <span className="bg-slate-100 px-4 py-2 rounded-full text-base font-semibold text-slate-600">
                                            {whitelist.length} Personnel
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
                                        {whitelist.length === 0 ? (
                                            <div className="text-center py-12 text-slate-400">
                                                <Users size={56} className="mx-auto mb-4 opacity-50" />
                                                <p className="font-medium text-lg">No personnel mapped yet</p>
                                                <p className="text-base">Add personnel using the form</p>
                                            </div>
                                        ) : (
                                            whitelist.map(u => (
                                                <div 
                                                    key={u.email} 
                                                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                                                            {u.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-lg text-slate-800">{u.email}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                                                    {u.assignedZone}
                                                                </span>
                                                                <span className="text-sm text-slate-400">{u.role || 'Inspector'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => removePersonnel(u.email)} 
                                                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={20}/>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========== AUDIT LOGS TAB ========== */}
                        {activeTab === 'logs' && (
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-3 rounded-xl">
                                            <FileText size={24} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800">System Audit Trails</h3>
                                            <p className="text-sm text-slate-500">Complete activity log</p>
                                        </div>
                                    </div>
                                    <span className="bg-slate-100 px-4 py-2 rounded-full text-base font-semibold text-slate-600">
                                        {firebaseLogs.length} Records
                                    </span>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b-2 border-slate-100">
                                                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Timestamp</th>
                                                <th className="p-4 text-sm font-bold text-slate-500 uppercase">User</th>
                                                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Role / Zone</th>
                                                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Action</th>
                                                <th className="p-4 text-sm font-bold text-slate-500 uppercase">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {firebaseLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center text-slate-400">
                                                        <Database size={56} className="mx-auto mb-4 opacity-50" />
                                                        <p className="font-medium text-lg">No activity logs found</p>
                                                        <p className="text-base">Logs will appear when actions are performed</p>
                                                    </td>
                                                </tr>
                                            ) : (
                                                firebaseLogs.map(log => (
                                                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                        <td className="p-4 text-base text-slate-600">{log.timeStr || "Just now"}</td>
                                                        <td className="p-4 text-base font-semibold text-blue-600">{log.user}</td>
                                                        <td className="p-4">
                                                            <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                                                                {log.role || 'SYSTEM'}
                                                            </span>
                                                            {log.zone && log.zone !== 'N/A' && (
                                                                <span className="ml-2 text-sm text-slate-400">{log.zone}</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`text-sm px-3 py-1 rounded-full font-semibold ${
                                                                log.action?.includes('LEAK') || log.action?.includes('CRITICAL') 
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : log.action?.includes('STARTED') || log.action?.includes('CONNECTED')
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : log.action?.includes('STOPPED') || log.action?.includes('DISCONNECTED')
                                                                    ? 'bg-amber-100 text-amber-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {log.action}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-base text-slate-700">{log.description || '-'}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-slate-800 text-white/60 py-4 text-center text-sm border-t-4 border-amber-500">
                © 2024 Solapur Municipal Corporation - Smart Water Pressure Management System | Designed by SMC IT Cell
            </footer>
        </div>
    );
}
