import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './CreatePassword.css';
import grad from '../../assets/createPassword/grad.svg';
import grad_1 from '../../assets/createPassword/Subtract.svg';
import logo from '../../assets/createPassword/Logo.svg';
import eyeOpened from '../../assets/createPassword/eye-svgrepo-com.svg';
import eyeClosed from '../../assets/createPassword/eye-slash-svgrepo-com.svg';

import { API_BASE } from '../../api/auth';

export default function CreatePassword() {
  const navigate = useNavigate();

  // Поля формы
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  // Видимость паролей
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Статусы
  const [sendLoading, setSendLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [formError, setFormError] = useState('');   // общие ошибки под блоком
  const [formOk, setFormOk] = useState('');         // общие успехи под блоком

  // Валидации
  const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const isCodeValid = (v: string) => /^\d{4,6}$/.test(v.trim());

  const validatePassword = (pass: string) => {
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumOrSym = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass);
    const longEnough = pass.length >= 8;
    if (!hasLetter) return 'Пароль повинен містити принаймні одну літеру.';
    if (!hasNumOrSym) return 'Пароль повинен містити принаймні одну цифру або спеціальний символ.';
    if (!longEnough) return 'Пароль повинен містити щонайменше 8 символів.';
    return '';
  };

  // Отправить код на e-mail
  const sendResetEmail = async () => {
    setFormError('');
    setFormOk('');

    if (!isEmailValid(email)) {
      setFormError('Будь ласка, введіть коректну електронну пошту.');
      return;
    }

    setSendLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/password/reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg =
          data?.detail ||
          (r.status === 404
            ? 'Сервіс відновлення пароля тимчасово недоступний.'
            : r.status === 429
            ? 'Забагато спроб. Спробуйте пізніше.'
            : 'Не вдалося надіслати лист. Спробуйте пізніше.');
        throw new Error(msg);
      }
      setFormOk(data?.detail || 'Код надіслано! Перевірте пошту (та папку «Спам»).');
    } catch (e: any) {
      setFormError(e.message || 'Помилка відправки листа.');
    } finally {
      setSendLoading(false);
    }
  };

  // Подтвердить код и сменить пароль
  const changePassword = async () => {
    setFormError('');
    setFormOk('');

    if (!isEmailValid(email)) {
      setFormError('Невірний e-mail.');
      return;
    }
    if (!isCodeValid(code)) {
      setFormError('Введіть код з e-mail (4–6 цифр).');
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setFormError(passError);
      return;
    }
    if (password !== repeatPassword) {
      setFormError('Паролі не співпадають.');
      return;
    }

    setSaveLoading(true);
    try {
      const r = await fetch(`${API_BASE}/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          new_password: password,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg = data?.detail || 'Не вдалося змінити пароль. Спробуйте ще раз.';
        throw new Error(msg);
      }
      setTimeout(() => navigate('/loginSite'), 1200);
    } catch (e: any) {
      setFormError(e.message || 'Помилка підтвердження коду.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="createPassword">
      <img className="grad" src={grad} alt="" />

      <div className="window_password_1">
        <img className="grad_1" src={grad_1} alt="" />

        <div className="band_logo_password_code_log_in">
          <div className="band_logo_password">
            <div className="logo_password">
              <div className="band_logo_create_new_password">
                <img className="logo" src={logo} alt="LumiTune" />
                <span className="logo_text">Придумайте новий пароль</span>
              </div>

              {/* EMAIL */}
              <div className="band_passwords" style={{ marginBottom: 8 }}>
                <div className="band_password">
                  <div className="band_text_password">
                    <span className="text_password">Електронна пошта</span>
                  </div>
                  <input
                    className="input_pass"
                    type="email"
                    placeholder="@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                {/* CODE */}
                <div className="band_repeat_password">
                  <div className="repeat_password">
                    <span className="text_repeat_password">Код з e-mail</span>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      className="input_repeat_pass"
                      type="text"
                      placeholder="Напр., 123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\s+/g, ''))}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              {/* PASSWORD */}
              <div className="band_passwords">
                <div className="band_password">
                  <div className="band_text_password">
                    <span className="text_password">Пароль</span>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      className="input_pass"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="*************"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <img
                      src={showPassword ? eyeOpened : eyeClosed}
                      alt={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                      className="passOpenedEye"
                      onClick={() => setShowPassword((v) => !v)}
                    />
                  </div>
                </div>

                {/* REPEAT PASSWORD */}
                <div className="band_repeat_password">
                  <div className="repeat_password">
                    <span className="text_repeat_password">Повторіть пароль</span>
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      className="input_repeat_pass"
                      type={showRepeatPassword ? 'text' : 'password'}
                      placeholder="*************"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <img
                      src={showRepeatPassword ? eyeOpened : eyeClosed}
                      alt={showRepeatPassword ? 'Сховати пароль' : 'Показати пароль'}
                      className="repeat_passOpenedEye"
                      onClick={() => setShowRepeatPassword((v) => !v)}
                    />
                  </div>
                </div>

                {/* Сообщения об ошибке/успехе */}
                {(formError || formOk) && (
                  <div
                    className={formError ? 'error-message' : 'lt-modal__msg lt-modal__msg--ok'}
                    style={{ marginTop: 8 }}
                  >
                    {formError || formOk}
                  </div>
                )}
              </div>
            </div>

            {/* КНОПКА СМЕНЫ ПАРОЛЯ — оставляем */}
            <button
              className="btn_change_password"
              onClick={changePassword}
              disabled={saveLoading}
            >
              <span className="change_password_text">
                {saveLoading ? 'Зберігаємо…' : 'Змінити пароль'}
              </span>
            </button>
          </div>

          {/* Отправить код на email */}
          <div className="band_get_code_log_in">
            <button className="btn_get_code" onClick={sendResetEmail} disabled={sendLoading}>
              <div className="get_code">
                <span className="get_code_text">
                  {sendLoading ? 'Надсилаємо…' : 'Отримайте новий код'}
                </span>
              </div>
            </button>

            <div className="password_remembered_log_in">
              <div className="password_remembered">
                <span className="text_password_remembered">Згадали пароль?</span>
              </div>
              <Link to="/loginSite" className="log_in_to_your_account">
                <span className="text_log_in_to_your_account">Увійдіть до аккаунту</span>
              </Link>
            </div>
          </div>
        </div>

        <Link to="/registration" className="band_back">
          <span className="back">Назад</span>
        </Link>
      </div>

      <div className="down"></div>
    </div>
  );
}
