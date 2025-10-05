
/*
  Usage notes:
  - Include Bootstrap CSS/JS and Chart.js CDN in your main HTML.
  - Endpoints used:
    POST /currencies/getAll
    POST /currencies/create
    POST /currencies/update
    POST /currencies/delete
    POST /exchange_rates/getAll
    POST /exchange_rates/addRate
  - This file is a single React component. You can split into separate files if you want.
*/


import React, { useEffect, useState, useRef } from "react";
import axios from '../../api/fetch';
import useNotification from "../../Hooks/useNotification";

// Bootstrap Admin page for Currencies & Exchange Rates (React + JSX)
// This file is written to match your project's style (axios instance, useNotification, Bootstrap modals via show/d-block).
// Endpoints used (POST):
//   /currencies/getAll  -> { page, limit, orderby, iso?, name?, symbol? }
//   /currencies/create
//   /currencies/update
//   /currencies/delete
//   /exchange_rates/getAll -> { page, limit, orderby, base?, target?, rate?, date? }
//   /exchange_rates/addRate
// Make sure these endpoints match your backend routes.

const currencyOrderOptions = [
  { label: "ISO ↑", value: "currency_iso-asc" },
  { label: "ISO ↓", value: "currency_iso-desc" },
  { label: "Name ↑", value: "name-asc" },
  { label: "Name ↓", value: "name-desc" },
  { label: "Symbol ↑", value: "symbol-asc" },
  { label: "Symbol ↓", value: "symbol-desc" },
  { label: "Created ↑", value: "createdAt-asc" },
  { label: "Created ↓", value: "createdAt-desc" },
  { label: "Updated ↑", value: "updatedAt-asc" },
  { label: "Updated ↓", value: "updatedAt-desc" },
];

const rateOrderOptions = [
  { label: "Date ↑", value: "date-asc" },
  { label: "Date ↓", value: "date-desc" },
  { label: "Rate ↑", value: "rate-asc" },
  { label: "Rate ↓", value: "rate-desc" },
  { label: "Base ↑", value: "base-asc" },
  { label: "Base ↓", value: "base-desc" },
  { label: "Target ↑", value: "target-asc" },
  { label: "Target ↓", value: "target-desc" },
];

export default function AdminCurrenciesExchangeBootstrap() {
  const { showNotification } = useNotification();

  // shared state for tabs
  const [tab, setTab] = useState('currencies');

  // --- currencies ---
  const [currencies, setCurrencies] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [curLimit, setCurLimit] = useState(10);
  const [curTotalPages, setCurTotalPages] = useState(1);
  const [curOrderby, setCurOrderby] = useState('createdAt-desc');
  const [curFilters, setCurFilters] = useState({ iso: '', name: '', symbol: '' });
  const [curLoading, setCurLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);

  // --- rates ---
  const [rates, setRates] = useState([]);
  const [ratePage, setRatePage] = useState(1);
  const [rateLimit, setRateLimit] = useState(10);
  const [rateTotalPages, setRateTotalPages] = useState(1);
  const [rateOrderby, setRateOrderby] = useState('date-desc');
  const [rateFilters, setRateFilters] = useState({ base: '', target: '', rate: '' });
  const [rateLoading, setRateLoading] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);

  // chart refs
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => { fetchCurrencies(); }, [curPage, curLimit, curOrderby]);
  useEffect(() => { fetchRates(); }, [ratePage, rateLimit, rateOrderby]);

  // ---------------- Currencies ----------------
  async function fetchCurrencies() {
    setCurLoading(true);
    try {
      const body = { page: curPage, limit: curLimit, orderby: curOrderby };
      if (curFilters.iso) body.iso = curFilters.iso;
      if (curFilters.name) body.name = curFilters.name;
      if (curFilters.symbol) body.symbol = curFilters.symbol;
      const res = await axios.post('/currencies/getAll', body);
      setCurrencies(res.data.currencies || []);
      setCurPage(res.data.currentPage || curPage);
      setCurTotalPages(res.data.totalPages || 1);
      showNotification('success','Currencies loaded');
    } catch (err) {
      showNotification('error', 'Failed to load currencies');
    } finally { setCurLoading(false); }
  }

  async function openCurrencyEditor(c) {
    setEditingCurrency(c || null);
    setShowCurrencyModal(true);
  }

  async function deleteCurrency(iso) {
    try {
      await axios.post('/currencies/delete', { iso });
      showNotification('success','Currency deleted');
      fetchCurrencies();
    } catch (err) {
      showNotification('error','Failed to delete currency');
    }
  }

  // ---------------- Exchange Rates ----------------
  async function fetchRates() {
    setRateLoading(true);
    try {
      const body = { page: ratePage, limit: rateLimit, orderby: rateOrderby };
      if (rateFilters.base) body.base = rateFilters.base;
      if (rateFilters.target) body.target = rateFilters.target;
      if (rateFilters.rate) { body.rate = rateFilters.rate; body.rateDir = 'bigger'; }
      const res = await axios.post('/exchange_rates/getAll', body);
      setRates(res.data.exchangerates || []);
      setRatePage(res.data.currentPage || ratePage);
      setRateTotalPages(res.data.totalPages || 1);
      showNotification('success','Rates loaded');
    } catch (err) {
      showNotification('error','Failed to load rates');
    } finally { setRateLoading(false); }
  }

  async function openRateChart(pair) {
    try {
      const res = await axios.post('/exchange_rates/getAll', { base: pair.base_currency_id, target: pair.target_currency_id, page:1, limit:100, orderby: 'date-desc' });
      const rows = res.data.exchangerates || [];
      const chart = rows.map(r => ({ x: r.dateofstart, y: Number(r.exchange_rate) })).reverse();
      drawChart(chart, `${pair.base_currency_id} → ${pair.target_currency_id}`);
    } catch (err) {
      showNotification('error','Failed to load chart data');
    }
  }

  function drawChart(data, label) {
    if (!window.Chart) return showNotification('error','Chart.js not loaded');
    const ctx = chartRef.current.getContext('2d');
    if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: { labels: data.map(d => d.x), datasets: [{ label, data: data.map(d => d.y), fill: false, tension: 0.2 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // ---------------- Modals submit handlers ----------------
  async function submitCurrency(payload, isEdit) {
    try {
      if (isEdit) await axios.post('/currencies/update', payload);
      else await axios.post('/currencies/create', payload);
      showNotification('success','Saved');
      setShowCurrencyModal(false);
      fetchCurrencies();
    } catch (err) {  showNotification('error', 'Save failed'); }
  }

  async function submitRate(payload) {
    try {
      await axios.post('/exchange_rates/addRate', payload);
      showNotification('success','Rate added');
      setShowRateModal(false);
      fetchRates();
    } catch (err) {  showNotification('error', 'Failed to add rate'); }
  }

  // small helpers for pagination buttons array
  function renderPageButtons(current, total, onClickPage) {
    const pages = [];
    for (let i = 1; i <= total; i++) pages.push(i);
    return (
      <div className="btn-group" role="group">
        <button className="btn btn-outline-primary" disabled={current===1} onClick={() => onClickPage(current-1)}>Prev</button>
        {pages.map(p => (
          <button key={p} className={`btn ${p===current ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => onClickPage(p)}>{p}</button>
        ))}
        <button className="btn btn-outline-primary" disabled={current===total} onClick={() => onClickPage(current+1)}>Next</button>
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Admin - Currencies & Exchange Rates</h3>
        <div>
          <button className={`btn me-2 ${tab==='currencies' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('currencies')}>Currencies</button>
          <button className={`${tab==='rates' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setTab('rates')}>Exchange Rates</button>
        </div>
      </div>

      {tab === 'currencies' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex gap-2">
              <input placeholder="ISO" className="form-control" style={{width:120}} value={curFilters.iso} onChange={e=>setCurFilters(f=>({...f,iso:e.target.value}))} />
              <input placeholder="Name" className="form-control" style={{width:160}} value={curFilters.name} onChange={e=>setCurFilters(f=>({...f,name:e.target.value}))} />
              <input placeholder="Symbol" className="form-control" style={{width:120}} value={curFilters.symbol} onChange={e=>setCurFilters(f=>({...f,symbol:e.target.value}))} />
              <button className="btn btn-primary" onClick={()=>{ setCurPage(1); fetchCurrencies(); }}>Search</button>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <select className="form-select" style={{width:180}} value={curLimit} onChange={e=>{ setCurLimit(Number(e.target.value)); setCurPage(1); }}>
                {[5,10,15,25,50].map(v=> <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="form-select" style={{width:200}} value={curOrderby} onChange={e=>{ setCurOrderby(e.target.value); setCurPage(1); }}>
                {currencyOrderOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="btn btn-success" onClick={()=>openCurrencyEditor(null)}>Add Currency</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ISO</th>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {curLoading ? (
                  <tr><td colSpan={4}>Loading...</td></tr>
                ) : currencies.length===0 ? (
                  <tr><td colSpan={4}>No currencies</td></tr>
                ) : currencies.map(c=> (
                  <tr key={c.currency_iso}>
                    <td>{c.currency_iso}</td>
                    <td>{c.name}</td>
                    <td>{c.symbol}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>openCurrencyEditor(c)}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteCurrency(c.currency_iso)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center mt-3">{renderPageButtons(curPage, curTotalPages, (p)=>{ setCurPage(p); })}</div>
        </div>
      )}

      {tab === 'rates' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex gap-2">
              <input placeholder="Base" className="form-control" style={{width:120}} value={rateFilters.base} onChange={e=>setRateFilters(f=>({...f,base:e.target.value}))} />
              <input placeholder="Target" className="form-control" style={{width:120}} value={rateFilters.target} onChange={e=>setRateFilters(f=>({...f,target:e.target.value}))} />
              <input placeholder="Min rate" className="form-control" style={{width:120}} value={rateFilters.rate} onChange={e=>setRateFilters(f=>({...f,rate:e.target.value}))} />
              <button className="btn btn-primary" onClick={()=>{ setRatePage(1); fetchRates(); }}>Search</button>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <select className="form-select" style={{width:120}} value={rateLimit} onChange={e=>{ setRateLimit(Number(e.target.value)); setRatePage(1); }}>
                {[5,10,15,25,50].map(v=> <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="form-select" style={{width:200}} value={rateOrderby} onChange={e=>{ setRateOrderby(e.target.value); setRatePage(1); }}>
                {rateOrderOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <button className="btn btn-success" onClick={()=>setShowRateModal(true)}>Add Rate</button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Base</th>
                  <th>Target</th>
                  <th>Rate</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rateLoading ? (<tr><td colSpan={5}>Loading...</td></tr>) : rates.length === 0 ? (<tr><td colSpan={5}>No rates</td></tr>) : rates.map(r=> (
                  <tr key={`${r.base_currency_id}-${r.target_currency_id}-${r.dateofstart}`}>
                    <td>{r.base_currency_id}</td>
                    <td>{r.target_currency_id}</td>
                    <td>{r.exchange_rate}</td>
                    <td>{r.dateofstart}</td>
                    <td><button className="btn btn-sm btn-outline-primary" onClick={()=>openRateChart(r)}>Chart</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center mt-3">{renderPageButtons(ratePage, rateTotalPages, (p)=>{ setRatePage(p); })}</div>

          <div className="card mt-4"><div className="card-body"><h6>Chart</h6><div style={{height:300}}><canvas ref={chartRef} style={{width:'100%',height:'100%'}}/></div></div></div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <CurrencyModal editing={editingCurrency} onClose={()=>{ setShowCurrencyModal(false); fetchCurrencies(); }} onSubmit={submitCurrency} />
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <RateModal onClose={()=>{ setShowRateModal(false); fetchRates(); }} onSubmit={submitRate} />
      )}

    </div>
  );
}

function CurrencyModal({ editing, onClose, onSubmit }) {
  const [iso, setIso] = useState(editing ? editing.currency_iso : '');
  const [name, setName] = useState(editing ? editing.name : '');
  const [symbol, setSymbol] = useState(editing ? editing.symbol : '');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const payload = editing ? { iso_edit: iso, iso: editing.currency_iso, name, symbol } : { iso, name, symbol };
      await onSubmit(payload, !!editing);
      onClose();
    } catch (err) {  }
    finally { setLoading(false); }
  }

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">{editing ? 'Edit' : 'Add'} Currency</h5><button className="btn-close" onClick={onClose}></button></div>
          <div className="modal-body">
            <div className="mb-2"><input className="form-control" placeholder="ISO" value={iso} onChange={e=>setIso(e.target.value)} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Symbol" value={symbol} onChange={e=>setSymbol(e.target.value)} /></div>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={loading}>{loading? 'Saving...':'Save'}</button></div>
        </div>
      </div>
    </div>
  );
}

function RateModal({ onClose, onSubmit }) {
  const [base, setBase] = useState('');
  const [target, setTarget] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await onSubmit({ base, target, rate: Number(rate), date });
      onClose();
    } catch (err) {  }
    finally { setLoading(false); }
  }

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add Rate</h5><button className="btn-close" onClick={onClose}></button></div>
          <div className="modal-body">
            <div className="mb-2"><input className="form-control" placeholder="Base" value={base} onChange={e=>setBase(e.target.value)} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Target" value={target} onChange={e=>setTarget(e.target.value)} /></div>
            <div className="mb-2"><input className="form-control" placeholder="Rate" value={rate} onChange={e=>setRate(e.target.value)} /></div>
            <div className="mb-2"><input type="date" className="form-control" value={date} onChange={e=>setDate(e.target.value)} /></div>
          </div>
          <div className="modal-footer"><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button></div>
        </div>
      </div>
    </div>
  );
}