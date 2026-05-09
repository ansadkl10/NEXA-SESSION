import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { QrCode, Smartphone, Loader2, ShieldCheck, Zap, KeyRound, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

let socket;

// മനോഹരമായ ബട്ടൺ കംപോണന്റ്
const NeonButton = ({ children, onClick, loading, icon: Icon, color = "cyan" }) => {
    const colors = {
        cyan: "hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] border-cyan-500/50 text-cyan-200 bg-cyan-950/20",
        green: "hover:shadow-[0_0_25px_rgba(50,255,50,0.5)] border-green-500/50 text-green-200 bg-green-950/20"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            disabled={loading}
            className={`w-full border p-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 ${colors[color]} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {loading ? (
                <Loader2 className="animate-spin h-6 w-6" />
            ) : (
                <>
                    {Icon && <Icon className="h-6 w-6" />}
                    {children}
                </>
            )}
        </motion.button>
    );
};

// വിജയിച്ച ശേഷം കാണിക്കുന്ന കാർഡ്
const ConnectedCard = ({ sessionID }) => {
    const [copied, setCopied] = useState(false);

    const copySession = () => {
        navigator.clipboard.writeText(sessionID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-green-500/30 bg-green-950/20 p-8 rounded-[2.5rem] text-center"
        >
            <CheckCircle2 className="mx-auto h-20 w-20 text-green-400 mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">Login Success!</h2>
            <p className="text-green-300/70 mb-6 text-sm">Your Session ID has been generated and sent to your WhatsApp.</p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-green-500/20 flex items-center justify-between gap-4 mb-4">
                <code className="text-green-400 text-xs font-mono truncate">{sessionID}</code>
                <button onClick={copySession} className="text-gray-500 hover:text-white transition">
                    {copied ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                </button>
            </div>
            
            <p className="text-gray-500 text-xs">Don't share this ID with anyone!</p>
        </motion.div>
    );
};

export default function Home() {
    const [method, setMethod] = useState('qr');
    const [phone, setPhone] = useState('');
    const [qr, setQr] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [sessionID, setSessionID] = useState(null);

    useEffect(() => {
        socket = io();
        socket.on('qr', (data) => { setQr(data); setLoading(false); setStatus('Scan QR Code'); });
        socket.on('code', (data) => { setCode(data); setLoading(false); setStatus('Enter this Pairing Code'); });
        socket.on('status', (data) => { setStatus(data.message); });
        
        socket.on('connected', (data) => {
            setSessionID(data.sessionID);
            setLoading(false);
            setStatus('Connected Successfully!');
            setQr(''); setCode('');
        });

        return () => socket.disconnect();
    }, []);

    const start = () => {
        if (method === 'pair' && !phone) return alert("Please enter phone number!");
        setLoading(true); setQr(''); setCode(''); setSessionID(null);
        setStatus('Initializing...');
        socket.emit('start-session', { type: method, phone });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradient Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-950/30 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-950/30 rounded-full blur-[128px]" />

            <div className="w-full max-w-md z-10 relative">
                
                {/* Header with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-3 text-cyan-300 text-xs tracking-widest uppercase">
                        <Zap className="w-3.5 h-3.5" /> Fast • Secure • Reliable
                    </div>
                    <h1 className="text-6xl font-extrabold mb-2 tracking-tighter italic bg-gradient-to-r from-white via-cyan-300 to-fuchsia-300 bg-clip-text text-transparent">NEXA-MD</h1>
                    <p className="text-gray-500 text-sm tracking-widest uppercase">Multi-Device Session Generator</p>
                </motion.div>
                
                <AnimatePresence mode="wait">
                    {sessionID ? (
                        <ConnectedCard sessionID={sessionID} />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
                        >
                            {/* Method Switcher */}
                            <div className="flex bg-[#0f0f0f] p-1.5 rounded-2xl mb-8 border border-white/5 relative">
                                <motion.div 
                                    className="absolute inset-y-1.5 bg-white rounded-xl shadow-lg"
                                    layoutId="activeMethodBg"
                                    animate={{ x: method === 'qr' ? 0 : '100%' }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    style={{ width: 'calc(50% - 6px)', left: 6 }}
                                />
                                <button onClick={() => setMethod('qr')} className={`flex-1 flex items-center justify-center gap-2.5 py-4 z-10 rounded-xl transition ${method === 'qr' ? 'text-black font-bold' : 'text-gray-500'}`}>
                                    <QrCode size={20}/> QR Code
                                </button>
                                <button onClick={() => setMethod('pair')} className={`flex-1 flex items-center justify-center gap-2.5 py-4 z-10 rounded-xl transition ${method === 'pair' ? 'text-black font-bold' : 'text-gray-500'}`}>
                                    <Smartphone size={20}/> Pairing Code
                                </button>
                            </div>

                            {/* Dynamic Content */}
                            <AnimatePresence mode="wait">
                                {loading && (
                                    <motion.div key="loader" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="flex flex-col items-center justify-center gap-4 py-10">
                                        <Loader2 className="animate-spin h-12 w-12 text-cyan-400" />
                                        <p className="text-gray-400 text-sm animate-pulse">{status}</p>
                                    </motion.div>
                                )}

                                {!loading && !qr && !code && (
                                    <motion.div key="input" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                        {method === 'pair' && (
                                            <div className="relative mb-5">
                                                <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-600" />
                                                <input 
                                                    type="number"
                                                    className="w-full bg-[#0f0f0f] border border-white/10 p-5 pl-16 rounded-2xl text-white text-2xl font-mono tracking-wider outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition" 
                                                    placeholder="9190xxxxxx" 
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)} 
                                                />
                                            </div>
                                        )}
                                        <NeonButton onClick={start} icon={Zap} color={method === 'qr' ? 'cyan' : 'green'}>
                                            Generate {method === 'qr' ? 'QR' : 'Code'}
                                        </NeonButton>
                                    </motion.div>
                                )}

                                {!loading && qr && (
                                    <motion.div key="qr" initial={{opacity: 0, scale: 0.5}} animate={{opacity: 1, scale: 1}} className="flex flex-col items-center gap-4">
                                        <div className="p-3 bg-white rounded-3xl border-4 border-cyan-500/20 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                                            <img src={qr} alt="WA QR Code" className="w-64 h-64 rounded-2xl" />
                                        </div>
                                        <p className="text-sm text-cyan-300/70 animate-pulse">{status}</p>
                                    </motion.div>
                                )}

                                {!loading && code && (
                                    <motion.div key="code" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex flex-col items-center gap-2 py-4">
                                        <p className="text-sm text-gray-500">Your Pairing Code:</p>
                                        <h2 className="text-6xl font-mono font-bold text-green-400 tracking-[10px] bg-green-950/30 px-6 py-3 rounded-2xl border border-green-500/20 shadow-[0_0_30px_rgba(50,255,50,0.15)]">{code}</h2>
                                        <p className="text-xs text-green-300/50 mt-2">Enter this in your WhatsApp linked devices.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer */}
                <div className="mt-10 flex items-center justify-center text-gray-700 text-[10px] uppercase tracking-widest gap-2">
                    <ShieldCheck size={14}/> E2E Encrypted & Session Not Stored
                </div>
            </div>
        </div>
    );
                }
              
