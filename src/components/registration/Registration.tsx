import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Registration.css";

import grad from "../../assets/registration/grad.svg";
import glass from "../../assets/registration/Subtract.svg";
import logo from "../../assets/registration/logo.svg";

import eyeOpened from "../../assets/registrationStepOne/eye-svgrepo-com.svg";
import eyeClosed from "../../assets/registrationStepOne/eye-slash-svgrepo-com.svg";
import anArrow from "../../assets/registrationStepTwo/anArrow.svg";

// 👇 добавлено
import { ApiError, loginJWT, registerUser, updateMe } from "../../api/auth";
type Country = { cca2: string; name: { common: string } };

export default function Registration() {
  const navigate = useNavigate();

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [email, setEmail] = useState("");
  const [emailErr, setEmailErr] = useState("");

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [maxDays, setMaxDays] = useState(31);

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [authorType, setAuthorType] = useState<"" | "user" | "author">("");

  // 👇 новое — статус запроса
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEmailValid = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const passHasLetter = /[a-zA-Z]/.test(password);
  const passHasNumOrSym = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const passLenOk = password.length >= 8;
  const isPasswordValid = passHasLetter && passHasNumOrSym && passLenOk;

  const MIN_AGE = 12;

  const calcAge = (yStr: string, mStr: string, dStr: string) => {
    const y = parseInt(yStr, 10), m = parseInt(mStr, 10), d = parseInt(dStr, 10);
    if (!y || !m || !d) return null;
    const today = new Date();
    const birth = new Date(y, m - 1, d);
    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - y;
    const mdiff = today.getMonth() - (m - 1);
    if (mdiff < 0 || (mdiff === 0 && today.getDate() < d)) age--;
    return age;
  };

  const age = calcAge(year, month, day);
  const isTooYoung = age !== null && age < MIN_AGE;

  const isDateValid =
    day !== "" &&
    month !== "" &&
    year !== "" &&
    parseInt(day, 10) > 0 &&
    parseInt(day, 10) <= maxDays;

  const isStep2Valid =
    name.trim() !== "" &&
    isDateValid &&
    !isTooYoung &&
    selectedCountry !== "" &&
    selectedCity !== "";

  const progress = useMemo(() => {
    if (step === 0) return isEmailValid(email) ? 10 : 0;
    if (step === 1) {
      const passed = [passHasLetter, passHasNumOrSym, passLenOk].filter(Boolean).length;
      return 10 + (passed / 3) * 50;
    }
    const flags = [
      name.trim() !== "",
      day !== "",
      month !== "",
      year !== "",
      selectedCountry !== "",
      selectedCity !== "",
    ].filter(Boolean).length;
    return 60 + (flags / 7) * 40;
  }, [step, email, passHasLetter, passHasNumOrSym, passLenOk, name, day, month, year, selectedCountry, selectedCity]);

  useEffect(() => {
    if (!email) setEmailErr("");
    else if (!isEmailValid(email)) setEmailErr("Будь ласка, введіть коректну електронну пошту.");
    else setEmailErr("");
  }, [email]);

  useEffect(() => {
    if (step !== 2 || !month || !year) return;
    const y = parseInt(year, 10) || 0;
    const m = parseInt(month, 10) || 1;
    const daysInMonth = new Date(y, m, 0).getDate();
    setMaxDays(daysInMonth);
    const d = parseInt(day, 10) || 0;
    if (d > daysInMonth) setDay(daysInMonth.toString());
  }, [step, month, year]);

  useEffect(() => {
    if (step !== 2) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all?fields=name,cca2");
        if (!resp.ok) throw new Error(String(resp.status));
        const data = await resp.json();
        if (cancelled) return;
        const list: Country[] = Array.isArray(data)
          ? data
              .map((i: any) => ({ cca2: i.cca2, name: { common: i?.name?.common || "" } }))
              .sort((a, b) => a.name.common.localeCompare(b.name.common))
          : [];
        setCountries(list);
      } catch {
        setCountries([]);
      }
    })();
    return () => { cancelled = true; };
  }, [step]);

  useEffect(() => {
    if (step !== 2 || !selectedCountry) return;
    let cancelled = false;
    (async () => {
      try {
        // ⛑️ HTTPS-версия GeoNames (free): secure.geonames.org
        const resp = await fetch(
          `https://secure.geonames.org/searchJSON?country=${encodeURIComponent(
            selectedCountry
          )}&maxRows=10&username=lumitune&lang=en`
        );
        if (!resp.ok) throw new Error(String(resp.status));
        const data = await resp.json();
        if (cancelled) return;
        const list: string[] = Array.isArray(data?.geonames)
          ? data.geonames.map((c: any) => c.name).sort()
          : [];
        setCities(list);
      } catch {
        setCities([]);
      }
    })();
    setSelectedCity("");
    return () => { cancelled = true; };
  }, [step, selectedCountry]);

  const goNext = () => {
    if (step === 0 && isEmailValid(email)) setStep(1);
    else if (step === 1 && isPasswordValid) setStep(2);
  };

  const goBack = () => {
    if (step === 0) navigate("/login");
    else setStep((s) => (s === 2 ? 1 : 0));
  };

 const submit = async () => {
  if (!isStep2Valid) return;

  const dob = `${String(year).padStart(4,"0")}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  setLoading(true);
  setApiError("");
  // сбросим ошибку email от API перед новой попыткой
  if (emailErr && isEmailValid(email)) setEmailErr("");

  try {
    // 1) регистрация
    await registerUser({ email, password });

    // 2) логин
    await loginJWT(email, password);

    // 3) обновление профиля (вложенный profile)
    await updateMe({
      full_name: name,
      profile: {
        display_name: name,
        date_of_birth: dob,
        country_code: selectedCountry,
        city: selectedCity,
      },
    });

    navigate("/main", { replace: true });
    // navigate("/");
    
  } catch (err: any) {
    if (err instanceof ApiError) {
      // Пытаемся распарсить тело, если оно объект
      const data = err.data;

      // Дубликат email
      const emailErrors: string[] | undefined =
        data?.email && Array.isArray(data.email) ? data.email : undefined;

      if (emailErrors && emailErrors.some((m: string) => /exists|already/i.test(m))) {
        setEmailErr("Ця електронна адреса вже зареєстрована. Спробуйте увійти або використайте іншу адресу.");
      }

      // Короткий пароль (если вдруг backend тоже вернёт)
      const passErrors: string[] | undefined =
        data?.password && Array.isArray(data.password) ? data.password : undefined;

      if (passErrors && passErrors.some((m: string) => /min_length|short|too short/i.test(m))) {
        setApiError("Пароль надто короткий. Мінімум 8 символів.");
      }

      // Общий fallback для 400
      if (err.status === 400 && !emailErrors && !passErrors) {
        setApiError("Будь ласка, перевірте заповнені поля і спробуйте ще раз.");
      }

      // На случай другого статуса/сообщения — покажем текст из ApiError
      if (!emailErrors && !passErrors && err.message) {
        setApiError(err.message);
      }
    } else {
      setApiError("Сталася помилка. Спробуйте ще раз трохи пізніше.");
    }
  } finally {
    setLoading(false);
  }
};
  const months = [
    { value: "1", label: "Січень" },
    { value: "2", label: "Лютий" },
    { value: "3", label: "Березень" },
    { value: "4", label: "Квітень" },
    { value: "5", label: "Травень" },
    { value: "6", label: "Червень" },
    { value: "7", label: "Липень" },
    { value: "8", label: "Серпень" },
    { value: "9", label: "Вересень" },
    { value: "10", label: "Жовтень" },
    { value: "11", label: "Листопад" },
    { value: "12", label: "Грудень" },
  ];

  return (
    <div className="registrationPage">
      <img className="registrationPage__bg" src={grad} alt="" />
      <div className="registrationPage__card">
        <img className="registrationPage__glass" src={glass} alt="" />

        <button className="registrationPage__back" onClick={goBack}>Назад</button>

        <div className="registrationPage__header">
          <img className="registrationPage__logo" src={logo} alt="logo" />
          <div className="registrationPage__titles">
            <span className="registrationPage__title">Створіть профіль</span>
            <span className="registrationPage__step">Крок {step + 1} із 3</span>
          </div>
        </div>

        <div className="registrationPage__progress">
          <div
            className="registrationPage__progressFill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Сообщение об ошибке API */}
        {apiError && (
          <div className="registrationPage__error registrationPage__error--block" style={{ marginTop: 8 }}>
            {apiError}
          </div>
        )}

        {/* STEP 0: EMAIL */}
        {step === 0 && (
          <div className="registrationPage__content">
            <div className="registrationPage__field">
              <label className="registrationPage__label">Електронна пошта</label>
              <input
                className="registrationPage__input"
                type="email"
                placeholder="@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {emailErr && <span className="registrationPage__error">{emailErr}</span>}
            </div>
            <button className="registrationPage__primaryBtn" onClick={goNext} disabled={!isEmailValid(email) || loading}>
              Далі
            </button>
          </div>
        )}

        {/* STEP 1: PASSWORD */}
        {step === 1 && (
          <div className="registrationPage__content">
            <div className="registrationPage__field">
              <label className="registrationPage__label">Пароль</label>
              <div className="registrationPage__passwordWrap">
                <input
                  className="registrationPage__input"
                  type={showPassword ? "text" : "password"}
                  placeholder="*************"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <img
                  className="registrationPage__eye"
                  src={showPassword ? eyeOpened : eyeClosed}
                  alt="toggle"
                  onClick={() => setShowPassword((v) => !v)}
                />
              </div>
            </div>

            <div className="registrationPage__reqs">
              <span>Пароль має містити принаймні:</span>
              <ul>
                <li className={passHasLetter ? "ok" : ""}>1 літеру</li>
                <li className={passHasNumOrSym ? "ok" : ""}>
                  1 число або 1 спеціальний символ (наприклад, _!?&#)
                </li>
                <li className={passLenOk ? "ok" : ""}>8 символів</li>
              </ul>
            </div>

            <button className="registrationPage__primaryBtn" onClick={goNext} disabled={!isPasswordValid || loading}>
              Далі
            </button>
          </div>
        )}

        {/* STEP 2: PROFILE */}
        {step === 2 && (
          <div className="registrationPage__content">
            <div className="registrationPage__field">
              <label className="registrationPage__label">Ім’я</label>
              <input
                className="registrationPage__input"
                type="text"
                placeholder="Ім’я"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <span className="registrationPage__hint">Це ім’я відображатиметься в профілі</span>
            </div>

            <div className="registrationPage__field">
              <label className="registrationPage__label">Дата народження</label>

              <div className="registrationPage__dateRow">
                <input
                  className="registrationPage__input registrationPage__input--center"
                  type="number"
                  placeholder="дд"
                  value={day}
                  onChange={(e) => {
                    const v = e.target.value;
                    const n = parseInt(v, 10) || 0;
                    if (v === "" || (n > 0 && n <= maxDays)) setDay(v);
                  }}
                  min={1}
                  max={maxDays}
                  onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                />

                <select
                  className="registrationPage__select"
                  style={{ backgroundImage: `url(${anArrow})` }}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="" disabled>Місяць</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>

                <input
                  className="registrationPage__input registrationPage__input--center"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="рррр"
                  value={year}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setYear(v);
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
                  }}
                />
              </div>

              {isTooYoung && (
                <div className="registrationPage__error registrationPage__error--block">
                  Вам має бути не менше {MIN_AGE} років для використання сервісу.
                </div>
              )}

              <span className="registrationPage__hint">
                Для чого нам потрібна ваша дата народження?{" "}
                <a className="registrationPage__link" href="/">Докладніше</a>
              </span>
            </div>

            <div className="registrationPage__field">
              <label className="registrationPage__label">Регіон проживання</label>
              <div className="registrationPage__row">
                <div className="registrationPage__col">
                  <span className="registrationPage__miniLabel">Країна</span>
                  <select
                    className="registrationPage__select"
                    style={{ backgroundImage: `url(${anArrow})` }}
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="" disabled>Країна</option>
                    {countries.map((c) => (
                      <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                    ))}
                  </select>
                </div>

                <div className="registrationPage__col">
                  <span className="registrationPage__miniLabel">Місто</span>
                  <select
                    className="registrationPage__select"
                    style={{ backgroundImage: `url(${anArrow})` }}
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedCountry}
                  >
                    <option value="" disabled>Місто</option>
                    {cities.map((city, i) => (
                      <option key={`${city}-${i}`} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <span className="registrationPage__hint">
                Для чого нам потрібен ваш регіон проживання?{" "}
                <a className="registrationPage__link" href="/">Докладніше</a>
              </span>
            </div>

            <button
              className="registrationPage__primaryBtn"
              onClick={submit}
              disabled={!isStep2Valid || loading}
            >
              {loading ? "Зачекайте..." : "Зареєструватися"}
            </button>
          </div>
        )}

        <div className="registrationPage__footer">
          <span>Є аккаунт?</span>
          <Link to="/login">Увійдіть до нього</Link>
        </div>
      </div>
    </div>
  );
}
