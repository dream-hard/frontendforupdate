

// export default ExchangeRateDetailModern;
import 'chartjs-adapter-date-fns';

import React, { useEffect, useRef } from "react";
import useNotification from "../../Hooks/useNotification";
import axios from "../../api/fetch";

const ExchangeRateDetailModern = ({ rate }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const { showNotification } = useNotification();

  // helper to pick base/target even if property names vary
  const getVal = (r, keys) => keys.map(k => r?.[k]).find(v => v !== undefined);

  // useEffect(() => {
  //   if (!rate) {
  //     // destroy any previous chart if rate becomes null
  //     if (chartInstanceRef.current) {
  //       chartInstanceRef.current.destroy();
  //       chartInstanceRef.current = null;
  //     }
  //     return;
  //   }

  //   // call chart loader when rate changes
  //   openRateChart(rate);

  //   // cleanup on unmount
  //   return () => {
  //     if (chartInstanceRef.current) {
  //       chartInstanceRef.current.destroy();
  //       chartInstanceRef.current = null;
  //     }
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [rate]);
  useEffect(() => {
  if (rate) openRateChart(rate);
  return () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
  };
}, [rate]);

  if (!rate) return <div>لا توجد تفاصيل</div>;

  const base = getVal(rate, ["base_currency_id", "base"]);
  const target = getVal(rate, ["target_currency_id", "target"]);
  const exchange_rate = rate.exchange_rate ?? rate.rate;
  const dateofstart = rate.dateofstart ?? rate.date;

  async function openRateChart(pair) {
    // guard
    const baseKey = pair.base_currency_id ?? pair.base;
    const targetKey = pair.target_currency_id ?? pair.target;
    if (!baseKey || !targetKey) return;

    try {
      // try the search endpoint; be permissive about response shape
      const payload = { base: baseKey, target: targetKey, page: 1, limit: 1000, orderby: "dateofstart-desc" };
      let res = await axios.post("/exch_rate/seachrates", payload).catch(e => null);

      // fallback to getall (some controllers use different endpoints)
      if (!res) {
        try { res = await axios.post("/exch_rate/getall", { page: 1, limit: 1000, orderby: "dateofstart-desc" }); }
        catch (e) { res = null; }
      }

      if (!res || !res.data) {
        showNotification("error", "لم يتم الحصول على بيانات الرسم البياني");
        return;
      }

      // tolerant read of returned rows
      const rows = res.data.exchangerates || res.data.rates || res.data.rows || res.data || [];
      // map and keep only rows that match this pair (some endpoints return many)
      const matched = rows.filter(r =>
        (String(r.base_currency_id || r.base) === String(baseKey)) &&
        (String(r.target_currency_id || r.target) === String(targetKey))
      );

      if (!matched.length) {
        showNotification("info", "لا يوجد بيانات تاريخية لعرضها");
        // ensure chart cleared
        if (chartInstanceRef.current) { chartInstanceRef.current.destroy(); chartInstanceRef.current = null; }
        return;
      }

      // convert to {x: date, y: number} and sort ascending by date
      const points = matched
        .map(r => ({ x: r.dateofstart ?? r.date, y: Number(r.exchange_rate ?? r.rate) }))
        .filter(p => p.x && Number.isFinite(p.y))
        .sort((a, b) => new Date(a.x) - new Date(b.x));

      drawChart(points, `${baseKey} → ${targetKey}`);
    } catch (err) {
      showNotification("error", "فشل تحميل بيانات الرسم البياني");
    }
  }

  // function drawChart(data, label) {
  //   if (!chartRef.current) return;
  //   if (!window.Chart) return showNotification("error", "Chart.js غير محمّل");

  //   const ctx = chartRef.current.getContext("2d");
  //   // destroy previous instance
  //   if (chartInstanceRef.current) {
  //     try { chartInstanceRef.current.destroy(); } catch (e) { /* ignore */ }
  //     chartInstanceRef.current = null;
  //   }

  //   // keep labels (dates) and values
  //   const labels = data.map(d => d.x);
  //   const values = data.map(d => d.y);

  //   chartInstanceRef.current = new window.Chart(ctx, {
  //     type: "line",
  //     data: {
  //       labels,
  //       datasets: [
  //         {
  //           label,
  //           data: values,
  //           fill: false,
  //           tension: 0.25,
  //           pointRadius: 2,
  //         }
  //       ]
  //     },
  //     options: {
  //       responsive: true,
  //       maintainAspectRatio: false,
  //       interaction: { mode: 'index', intersect: false },
  //       plugins: {
  //         legend: { display: true },
  //         tooltip: {
  //           callbacks: {
  //             label: (ctx) => {
  //               const val = ctx.parsed.y;
  //               return ` ${label}: ${Number(val).toLocaleString(undefined, { maximumFractionDigits: 10 })}`;
  //             }
  //           }
  //         }
  //       },
  //       scales: {
  //         x: { type: 'time', time: { parser: 'YYYY-MM-DD', unit: 'day', tooltipFormat: 'yyyy-MM-dd' }, title: { display: false } },
  //         y: { beginAtZero: false, title: { display: true, text: 'Rate' } }
  //       }
  //     }
  //   });
  // }

  function drawChart(data, label) {
  if (!window.Chart) return showNotification('error','Chart.js not loaded');
  const ctx = chartRef.current?.getContext('2d');
  if (!ctx) return;

  // destroy previous chart
  if (chartInstanceRef.current) {
    chartInstanceRef.current.destroy();
    chartInstanceRef.current = null;
  }

  chartInstanceRef.current = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(d => d.x),
      datasets: [{ label, data: data.map(d => d.y), fill: false, tension: 0.2 }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

  return (
    <div className="container py-3">
      <h4 className="mb-3 text-primary">{base} → {target}</h4>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Base</label>
          <input className="form-control" value={base} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Target</label>
          <input className="form-control" value={target} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Exchange Rate</label>
          <input className="form-control" value={exchange_rate} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input className="form-control" value={dateofstart} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Created At</label>
          <input className="form-control" value={rate.createdAt || ''} disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label">Updated At</label>
          <input className="form-control" value={rate.updatedAt || ''} disabled />
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h6>Chart</h6>
          <div style={{ height: 300 }}>
            <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateDetailModern;
