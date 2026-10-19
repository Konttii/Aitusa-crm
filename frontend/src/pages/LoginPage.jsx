import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { setDemoInitData } from '../shared/telegram.js';
import logoUrl from '../shared/aitusa_logo.png';

const DEMO_PROFILES = [
  { telegramId: 100000001, label: 'Президент AITUSA (Полный доступ)', sub: 'Создание, назначение и удаление задач всех комитетов' },
  { telegramId: 100000002, label: 'Глава комитета (Digitalization)', sub: 'Управление задачами своего комитета' },
  { telegramId: 100000003, label: 'Участник (Digitalization)', sub: 'Взятие свободных задач и работа над своими поручениями' },
];

export default function LoginPage() {
  const { login, error } = useAuth();
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  async function retry() {
    setPending(true);
    try {
      await login();
      navigate('/tasks');
    } catch {
      // Error is handled by AuthContext
    } finally {
      setPending(false);
    }
  }

  async function loginAsDemo(telegramId) {
    setPending(true);
    try {
      setDemoInitData(telegramId);
      await login();
      navigate('/tasks');
    } catch {
      // Error is handled by AuthContext
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__logo-badge" aria-hidden="true">
        <img src={logoUrl} alt="AITUSA" className="login-page__logo-img" />
      </div>
      <h1 className="login-page__title">AITUSA CRM</h1>
      <p className="login-page__subtitle">Управление задачами и поручениями</p>
      <div className="login-card form-stack">
        <p>Откройте приложение через Telegram Mini App или выберите демо-профиль для локального просмотра:</p>
        {error && <div className="form-error" role="alert">{error}</div>}
        {DEMO_PROFILES.map((profile) => (
          <button
            key={profile.telegramId}
            type="button"
            className="btn btn--secondary btn--full"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 2, padding: '10px 14px' }}
            onClick={() => loginAsDemo(profile.telegramId)}
            disabled={pending}
          >
            <span style={{ fontWeight: 700, fontSize: 14 }}>{profile.label}</span>
            <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 400 }}>{profile.sub}</span>
          </button>
        ))}
        <button className="btn btn--primary btn--full" onClick={retry} disabled={pending}>
          {pending ? 'Проверяем…' : 'Войти через Telegram сессию'}
        </button>
      </div>
    </div>
  );
}
