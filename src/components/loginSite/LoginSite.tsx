import './LoginSite.css';
import gradient from '../../assets/loginSite/gradient.svg';
import grad from '../../assets/loginSite/Rectangle 4266.svg';
import window_grad from '../../assets/loginSite/Subtract.svg';
import logo from '../../assets/loginSite/logo.svg';
import line2 from '../../assets/loginSite/line2.svg';
import eyeOpened from '../../assets/loginSite/eye-svgrepo-com.svg';
import eyeClosed from '../../assets/loginSite/eye-slash-svgrepo-com.svg';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginJWT } from '../../api/auth';           // 👈 подключаем API

function LoginSite() {
  const [showPassword, setShowPassword] = useState(false);
  const [eyeSrc, setEyeSrc] = useState(eyeClosed);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiError, setApiError] = useState('');       // 👈 новое
  const [loading, setLoading] = useState(false);      // 👈 новое
  const navigate = useNavigate();                     // 👈 навигация

  const togglePasswordVisibility = () => {
    setShowPassword(v => !v);
    setEyeSrc(src => (src === eyeClosed ? eyeOpened : eyeClosed));
  };

  const isLoginValid = (val: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); // бэку нужен email

  const isPasswordValid = (val: string) => {
    const ok = val.trim() !== '' && val.length >= 8;
    return { isValid: ok, message: ok ? '' : 'Пароль повинен містити мінімум 8 символів.' };
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLogin(v);
    if (v && !isLoginValid(v)) setErrorMessage('Будь ласка, введіть коректну електронну пошту.');
    else if (password && !isPasswordValid(password).isValid) setErrorMessage(isPasswordValid(password).message);
    else setErrorMessage('');
    setApiError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setPassword(v);
    if (v && !isPasswordValid(v).isValid) setErrorMessage(isPasswordValid(v).message);
    else if (v && !isLoginValid(login)) setErrorMessage('Будь ласка, введіть коректну електронну пошту.');
    else setErrorMessage('');
    setApiError('');
  };

  const isFormValid = () => isLoginValid(login) && isPasswordValid(password).isValid;

  // ⬇️ реальный логин + красивое сообщение об ошибке
  const handleEnterClick = async () => {
    if (!isFormValid() || loading) return;
    setLoading(true);
    setApiError('');

    try {
      await loginJWT(login, password); // POST /api/auth/jwt/create/
      navigate("/main");                // куда вести после входа — на твой вкус
    } catch (e: any) {
      // fetchJSON из auth.ts бросает Error(msg). msg берётся из detail/error/message или "status statusText"
      const msg = (e?.message || '').toLowerCase();

      // Нормализуем несколько частых случаев:
      if (msg.includes('no active account') || msg.includes('invalid') || msg.includes('401')) {
        setApiError('Невірна електронна пошта або пароль.');
      } else if (msg.includes('400') || msg.includes('bad request')) {
        setApiError('Некоректні дані. Перевірте введені поля.');
      } else if (msg.includes('network')) {
        setApiError('Немає з’єднання з сервером. Перевірте мережу.');
      } else {
        setApiError('Сталася помилка під час входу. Спробуйте ще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Сабмит по Enter в любом поле
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEnterClick();
  };

  return (
    <div className='loginSite'>
      <img className='grad' src={grad} alt='' />
      <img className='gradient' src={gradient} alt='' />
      <div className='window_entrance'>
        <img className='window_grad' src={window_grad} alt='' />
        <div className='band_window_entrance'>
          <div className='band_main'>
            <div className='band_lumitune'>
              <img className='logo' src={logo} alt='' />
              <div className='lumitune'>Пориньте у LumiTune</div>
            </div>

            <div className='entrance'>
              <div className='band_login_pass'>
                <div className='login_pass'>
                  <div className='band_login'>
                    <div className='band_login_text'>
                      <div className='login_text'>Електронна пошта</div>
                      <input
                        className='input_login'
                        type='email'
                        placeholder='@gmail.com'
                        value={login}
                        onChange={handleLoginChange}
                        onKeyDown={onKeyDown}
                        autoComplete='email'
                      />
                      {(errorMessage || apiError) && (
                        <span className='error-message'>
                          {apiError || errorMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='band_pass'>
                    <div className='band_pass_text'>
                      <div className='frame_pass'>
                        <div className='pass_text'>Пароль</div>
                      </div>
                      <div className='band_forgot_your_password'>
                        <Link to='/forgot-password' className='forgot_your_password_text'>
                          Забули пароль?
                        </Link>
                      </div>
                    </div>
                    <div className='passFieldWrap'>
                      <input
                        className='input_pass'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='*************'
                        value={password}
                        onChange={handlePasswordChange}
                        onKeyDown={onKeyDown}
                        autoComplete='current-password'
                      />
                      <img
                        src={eyeSrc}
                        alt={showPassword ? 'closedEyeSymbol' : 'openedEyeSymbol'}
                        className='passOpenedEye'
                        onClick={togglePasswordVisibility}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className='btn_enter'
                  onClick={handleEnterClick}
                  disabled={!isFormValid() || loading}
                >
                  <span className='enter_text'>{loading ? 'Увійходимо…' : 'Увійти'}</span>
                </button>
              </div>
            </div>
          </div>

          <img className='line2' src={line2} alt='' />
          <div className='band_down'>
            <div className='band_no_account'>
              <span className='text_no_account'>Немає аккаунта?</span>
            </div>
            <Link to='/registration' className='registration_in_lumitune'>
              <span className='text_registration_in_lumitune'>Реєстрація у LumiTune</span>
            </Link>
            <div className='band'></div>
          </div>
        </div>
      </div>

      <div className='down'></div>
    </div>
  );
}

export default LoginSite;
