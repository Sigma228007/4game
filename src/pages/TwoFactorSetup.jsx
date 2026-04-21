import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, Check, AlertCircle, Copy, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { PageTransition, Reveal } from '../components/Motion';

export default function TwoFactorSetup() {
  const { user } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState(null);  // { enabled }
  const [step, setStep] = useState('status');  // status | setup | verify | disable
  const [secret, setSecret] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get2FAStatus().then(setStatus).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Доступ только для admin/support
  if (!loading && user && user.role !== 'admin' && user.role !== 'support') {
    return <Navigate to="/profile" replace />;
  }

  async function handleSetup() {
    setSubmitting(true);
    try {
      const res = await api.setup2FA();
      setSecret(res.secret);
      setOtpauth(res.otpauth);
      setStep('verify');
    } catch (err) { toast(err.message, 'error'); }
    setSubmitting(false);
  }

  async function handleVerify(e) {
    e.preventDefault();
    if (code.length !== 6) { toast('Код должен быть из 6 цифр', 'error'); return; }
    setSubmitting(true);
    try {
      await api.verify2FA(code);
      toast('2FA включена. Отныне при входе запрашивается код.', 'success');
      setStatus({ enabled: true });
      setStep('status');
      setCode('');
    } catch (err) { toast(err.message, 'error'); }
    setSubmitting(false);
  }

  async function handleDisable(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.disable2FA(code);
      toast('2FA отключена', 'success');
      setStatus({ enabled: false });
      setStep('status');
      setCode('');
    } catch (err) { toast(err.message, 'error'); }
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8 py-10 md:py-14">
          <Reveal>
            <div className="mb-10">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center">
                  <Shield size={24} className="text-accent" />
                </div>
                <div className="flex-1">
                  <span className="label block mb-2">Безопасность аккаунта</span>
                  <h1 className="section-title text-3xl">Двухфакторная аутентификация</h1>
                </div>
              </div>
            </div>
          </Reveal>

          {/* STATUS VIEW */}
          {step === 'status' && (
            <Reveal delay={0.05}>
              <div className="glass-static p-6 md:p-8 space-y-5">
                {status?.enabled ? (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                      <Check size={20} className="text-accent flex-shrink-0" />
                      <div>
                        <p className="font-display font-bold text-[13px] text-accent">2FA включена</p>
                        <p className="font-body text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          Аккаунт защищён кодом из приложения Google Authenticator / Authy
                        </p>
                      </div>
                    </div>
                    <div className="pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                      <h3 className="font-display font-bold text-[14px] mb-3" style={{ color: 'var(--text)' }}>Отключить 2FA</h3>
                      <p className="font-body text-[13px] mb-4" style={{ color: 'var(--text-muted)' }}>
                        Введите текущий код из приложения, чтобы отключить двухфакторку
                      </p>
                      <form onSubmit={handleDisable} className="flex gap-2">
                        <input
                          value={code}
                          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="input flex-1 font-mono text-center tracking-[0.5em] text-lg"
                        />
                        <button type="submit" disabled={submitting || code.length !== 6} className="btn-primary px-4 disabled:opacity-50">
                          {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Отключить'}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/20">
                      <AlertCircle size={20} className="text-amber-400 flex-shrink-0" />
                      <div>
                        <p className="font-display font-bold text-[13px] text-amber-400">2FA не активирована</p>
                        <p className="font-body text-[12px]" style={{ color: 'var(--text-muted)' }}>
                          Рекомендуем включить для защиты админ-доступа
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <h3 className="font-display font-bold text-[14px] mb-2" style={{ color: 'var(--text)' }}>Как это работает</h3>
                      <ol className="space-y-2 font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>
                        <li>1. Установите приложение <strong>Google Authenticator</strong> или <strong>Authy</strong> на телефон</li>
                        <li>2. Отсканируйте QR-код или введите секрет вручную</li>
                        <li>3. Введите 6-значный код из приложения для подтверждения</li>
                      </ol>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSetup}
                        disabled={submitting}
                        className="btn-primary mt-5 text-[13px] disabled:opacity-50"
                      >
                        {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Shield size={14} /> Включить 2FA</>}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          )}

          {/* VERIFY (SETUP) VIEW */}
          {step === 'verify' && (
            <Reveal>
              <div className="glass-static p-6 md:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-accent" />
                  <h3 className="font-display font-bold text-[14px]" style={{ color: 'var(--text)' }}>Настройка приложения</h3>
                </div>

                {/* QR через встроенный генератор */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="p-3 bg-white rounded-xl flex-shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`}
                      alt="2FA QR code"
                      className="w-[200px] h-[200px]"
                    />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="font-body text-[13px]" style={{ color: 'var(--text-muted)' }}>
                      Отсканируй QR-код в приложении Google Authenticator или Authy
                    </p>
                    <div>
                      <span className="label block mb-2">Или введи секрет вручную:</span>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg font-mono text-[12px] break-all" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
                          {secret}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(secret); toast('Скопировано', 'success'); }}
                          className="p-2 rounded-lg hover:bg-white/5"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerify} className="pt-5 border-t space-y-3" style={{ borderColor: 'var(--surface-border)' }}>
                  <label className="label block">Код из приложения</label>
                  <input
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                    className="input font-mono text-center tracking-[0.5em] text-2xl py-4"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setStep('status'); setCode(''); }} className="btn-ghost flex-1">
                      Отмена
                    </button>
                    <button type="submit" disabled={submitting || code.length !== 6} className="btn-primary flex-1 disabled:opacity-50">
                      {submitting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={14} /> Подтвердить</>}
                    </button>
                  </div>
                </form>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
