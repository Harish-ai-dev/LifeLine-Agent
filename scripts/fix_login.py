import re

file_path = r"c:\Users\shado\Documents\GitHub\LifeLine-Agent\frontend\src\components\auth\LoginView.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I will replace the entire LoginForm function
# I need to find `function LoginForm({ portal }: { portal: PortalDef }) {` and replace to end of file

# Since it's at the end of the file, I can just slice the file.
idx = content.find("function LoginForm({ portal }:")
if idx != -1:
    content = content[:idx] + """function LoginForm({ portal }: { portal: PortalDef }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) { setError('Please enter your email/username.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setIsLoading(true);
    soundEffects.playAcknowledgeChime();

    try {
      setSuccess(`Authenticating with Firebase...`);
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase Auth is disabled or missing configuration.");
      
      // Enforce Strict Firebase Authentication
      await signInWithEmailAndPassword(auth, username.trim(), password);
      
      // The onAuthStateChanged hook in DashboardContext will handle state hydration.
      // We just need to route the user.
      setSuccess('Authenticated! Routing...');
      setTimeout(() => {
        if (portal.role === 'hospital_staff' || portal.role === 'hospital_director') router.push('/hospital');
        else if (portal.role === 'government_authority') router.push('/government');
        else if (portal.role === 'blood_donor') router.push('/donor');
        else if (portal.role === 'admin') router.push('/admin');
      }, 500);

    } catch (err: any) {
      console.error("Firebase Auth Error:", err);
      // Strip confusing Firebase error codes for the UI
      const msg = err.code?.includes('auth/') ? 'Invalid email or password.' : err.message;
      setError(msg || 'Authentication error. Please try again.');
      setIsLoading(false);
      setSuccess('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
      {/* Username */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Email / Username
        </label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            placeholder={portal.placeholder}
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(''); }}
            autoFocus
            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${portal.ring} text-slate-900 dark:text-white placeholder:text-slate-400 font-mono transition-all`}
            autoComplete="username"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="block text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            className={`w-full pl-10 pr-11 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 ${portal.ring} text-slate-900 dark:text-white placeholder:text-slate-400 font-mono transition-all`}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 font-mono">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}
      {success && !error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 animate-pulse" />{success}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 px-6 ${portal.btnBg} text-white font-mono font-black text-sm rounded-2xl shadow-lg ${portal.btnShadow} flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2`}
      >
        {isLoading ? (
          <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />AUTHENTICATING…</>
        ) : (
          <><Zap className="w-4 h-4" />SIGN IN<ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {/* Demo hint */}
      <div 
        onClick={() => { setUsername(portal.hint); setPassword(process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'password123'); }}
        className={`flex items-start gap-2 p-3 rounded-xl border text-[11px] font-mono ${portal.hintBg} ${portal.hintColor} cursor-pointer hover:opacity-80 transition-opacity`}
        title="Click to autofill"
      >
        <span className="shrink-0 mt-0.5">💡</span>
        <span>
          <span className="font-bold opacity-70">Demo: </span>
          {portal.hint}
          <span className="block opacity-60 mt-0.5">Click to autofill demo credentials.</span>
        </span>
      </div>
    </form>
  );
}
"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed LoginForm")
