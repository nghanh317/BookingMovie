import { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Helpers ─────────────────────────────────────────────── */

/** Kiểm tra ngày hợp lệ */
function isValidDate(d, m, y) {
  if (!d || !m || !y) return false;
  const dd = Number(d), mm = Number(m), yy = Number(y);
  if (isNaN(dd) || isNaN(mm) || isNaN(yy)) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1) return false;
  if (yy < 1900 || yy > 2100) return false;
  const date = new Date(yy, mm - 1, dd);
  return date.getFullYear() === yy && date.getMonth() === mm - 1 && date.getDate() === dd;
}

/** YYYY-MM-DD → DD/MM/YYYY */
function isoToDisplay(iso) {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length !== 3) return '';
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

/** DD/MM/YYYY → YYYY-MM-DD (trả '' nếu không hợp lệ) */
function displayToISO(display) {
  if (!display) return '';
  const parts = display.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  if (!isValidDate(d, m, y)) return '';
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VI = ['CN','T2','T3','T4','T5','T6','T7'];

/* ─── Calendar Popup ───────────────────────────────────────── */
function CalendarPopup({ isoValue, onChange, onClose, minISO, maxISO }) {
  const today = new Date();
  const initDate = isoValue ? new Date(isoValue + 'T00:00:00') : today;

  const [viewYear, setViewYear]   = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth()); // 0-indexed
  const [yearInput, setYearInput] = useState(String(initDate.getFullYear()));
  const [mode, setMode]           = useState('day'); // 'day' | 'month' | 'year'

  const selectedISO = isoValue || '';
  const minDate = minISO ? new Date(minISO + 'T00:00:00') : null;
  const maxDate = maxISO ? new Date(maxISO + 'T00:00:00') : null;

  /* Build calendar grid (days of month with leading/trailing blanks) */
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Adjust: week starts Monday
  const startOffset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (d) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    onChange(iso);
    onClose();
  };

  const isCellDisabled = (d) => {
    const date = new Date(viewYear, viewMonth, d);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isSelected = (d) => {
    const iso = `${viewYear}-${String(viewMonth + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return iso === selectedISO;
  };

  const isToday = (d) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() && d === today.getDate();
  };

  /* Year range for year picker */
  const yearRangeStart = Math.floor(viewYear / 12) * 12;
  const yearRange = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  return (
    <div
      className="absolute z-[200] mt-1 bg-[#1a1a2e] border border-[#2e2e4e] rounded-xl shadow-2xl p-3 w-72 select-none"
      style={{ top: '100%', left: 0 }}
      onMouseDown={e => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#2a2a4a] hover:text-white transition-colors"
        >‹</button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode(mode === 'month' ? 'day' : 'month')}
            className="px-2 py-0.5 rounded text-sm font-semibold text-white hover:bg-[#2a2a4a] transition-colors"
          >
            {MONTHS_VI[viewMonth]}
          </button>
          <button
            onClick={() => setMode(mode === 'year' ? 'day' : 'year')}
            className="px-2 py-0.5 rounded text-sm font-semibold text-primary hover:bg-[#2a2a4a] transition-colors"
          >
            {viewYear}
          </button>
        </div>

        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#2a2a4a] hover:text-white transition-colors"
        >›</button>
      </div>

      {/* Month picker */}
      {mode === 'month' && (
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {MONTHS_VI.map((mn, i) => (
            <button key={i}
              onClick={() => { setViewMonth(i); setMode('day'); }}
              className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                i === viewMonth
                  ? 'bg-primary text-black font-bold'
                  : 'text-gray-300 hover:bg-[#2a2a4a] hover:text-white'
              }`}
            >{mn}</button>
          ))}
        </div>
      )}

      {/* Year picker */}
      {mode === 'year' && (
        <div>
          <div className="flex items-center gap-1 mb-2">
            <button onClick={() => setViewYear(y => y - 12)} className="px-2 py-1 text-gray-400 hover:text-white text-sm">‹‹</button>
            <input
              type="number"
              value={yearInput}
              onChange={e => {
                setYearInput(e.target.value);
                const y = Number(e.target.value);
                if (y >= 1900 && y <= 2100) setViewYear(y);
              }}
              className="flex-1 bg-[#2a2a4a] border border-[#3a3a5a] rounded-lg px-2 py-1 text-white text-sm text-center outline-none"
            />
            <button onClick={() => setViewYear(y => y + 12)} className="px-2 py-1 text-gray-400 hover:text-white text-sm">››</button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-2">
            {yearRange.map(yr => (
              <button key={yr}
                onClick={() => { setViewYear(yr); setYearInput(String(yr)); setMode('day'); }}
                className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  yr === viewYear
                    ? 'bg-primary text-black font-bold'
                    : 'text-gray-300 hover:bg-[#2a2a4a] hover:text-white'
                }`}
              >{yr}</button>
            ))}
          </div>
        </div>
      )}

      {/* Day grid */}
      {mode === 'day' && (
        <>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {DAYS_VI.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-gray-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const disabled = isCellDisabled(d);
              const selected = isSelected(d);
              const todayCell = isToday(d);
              return (
                <button
                  key={i}
                  disabled={disabled}
                  onClick={() => !disabled && selectDay(d)}
                  className={`h-8 w-full rounded-lg text-xs font-medium transition-all ${
                    selected
                      ? 'bg-primary text-black font-bold shadow-md'
                      : todayCell
                      ? 'border border-primary/60 text-primary'
                      : disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-200 hover:bg-[#2a2a4a] hover:text-white'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Quick: Hôm nay */}
          <button
            onClick={() => {
              const iso = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
              onChange(iso);
              onClose();
            }}
            className="mt-3 w-full py-1.5 rounded-lg border border-primary/40 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
          >
            📅 Hôm nay
          </button>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────── */
/**
 * DatePickerInput
 * @param {string}   value       - ISO string YYYY-MM-DD (controlled)
 * @param {Function} onChange    - callback(isoString) – trả '' nếu trống
 * @param {string}   placeholder - mặc định 'DD/MM/YYYY'
 * @param {string}   className
 * @param {boolean}  disabled
 * @param {string}   minISO      - YYYY-MM-DD, ngày tối thiểu cho calendar
 * @param {string}   maxISO      - YYYY-MM-DD, ngày tối đa cho calendar
 */
export default function DatePickerInput({
  value = '',
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  disabled = false,
  minISO,
  maxISO,
}) {
  const [text, setText]       = useState(isoToDisplay(value));
  const [error, setError]     = useState('');
  const [open, setOpen]       = useState(false);
  const wrapRef               = useRef(null);

  /* Sync khi value thay đổi từ bên ngoài */
  useEffect(() => {
    setText(isoToDisplay(value));
    setError('');
  }, [value]);

  /* Đóng calendar khi click ngoài */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Xử lý nhập tay */
  const handleChange = (e) => {
    let raw = e.target.value.replace(/[^0-9/]/g, '');

    // Auto-insert '/'
    if (raw.length === 2 && text.length === 1 && !raw.includes('/')) raw += '/';
    if (raw.length === 5 && text.length === 4 && raw.split('/').length < 3) raw += '/';

    setText(raw);

    const parts = raw.split('/');
    if (raw.length === 10 && parts.length === 3) {
      const [d, m, y] = parts;
      if (!isValidDate(d, m, y)) {
        setError('Ngày không hợp lệ');
        onChange?.('');
      } else {
        setError('');
        onChange?.(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
      }
    } else if (raw.length === 0) {
      setError('');
      onChange?.('');
    } else {
      setError('');
    }
  };

  /* Xử lý blur – validate cuối cùng */
  const handleBlur = () => {
    if (!text) { setError(''); return; }
    const parts = text.split('/');
    if (parts.length !== 3 || text.length !== 10) {
      setError('Định dạng: DD/MM/YYYY');
      return;
    }
    const [d, m, y] = parts;
    if (!isValidDate(d, m, y)) {
      setError('Ngày không hợp lệ');
    } else {
      setError('');
    }
  };

  /* Calendar chọn ngày */
  const handleCalendarChange = useCallback((iso) => {
    setText(isoToDisplay(iso));
    setError('');
    onChange?.(iso);
  }, [onChange]);

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => {}}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className={`${className} pr-9 ${error ? 'border-red-500 focus:border-red-500' : ''}`}
        />
        {/* Calendar icon button */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors disabled:opacity-40"
          title="Chọn ngày"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-[11px] mt-0.5 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Calendar popup */}
      {open && (
        <CalendarPopup
          isoValue={value}
          onChange={handleCalendarChange}
          onClose={() => setOpen(false)}
          minISO={minISO}
          maxISO={maxISO}
        />
      )}
    </div>
  );
}
