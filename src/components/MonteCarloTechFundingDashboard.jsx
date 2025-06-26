import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
         Tooltip, ResponsiveContainer } from 'recharts';

export default function MonteCarloTechFundingDashboard() {
  const [tickers, setTickers] = useState('AAPL,MSFT,GOOGL');
  const [runs, setRuns]       = useState(5000);
  const [data, setData]       = useState([]);
  const [busy, setBusy]       = useState(false);

  useEffect(() => () => { self.mcW?.terminate(); }, []);

  const run = () => {
    setBusy(true);
    if (!self.mcW)
      self.mcW = new Worker(new URL('../workers/monteCarloWorker.js', import.meta.url));

    self.mcW.onmessage = e => { setData(e.data); setBusy(false); };
    self.mcW.postMessage({ assets: tickers.split(',').map(t => t.trim()), runs });
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Monte Carlo Portfolio Optimizer</h1>
      <input className="w-full p-2 text-black mb-2" value={tickers}
             onChange={e => setTickers(e.target.value)} />
      <input className="w-full p-2 text-black mb-2" type="number" min="100" max="100000"
             value={runs} onChange={e => setRuns(+e.target.value)} />
      <button onClick={run} disabled={busy}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4">
        {busy ? 'Running…' : 'Run Simulation'}
      </button>

      {data.length > 0 &&
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart><CartesianGrid/><XAxis dataKey="vol"/><YAxis dataKey="ret"/>
            <Tooltip/><Scatter data={data} fill="#38bdf8" />
          </ScatterChart>
        </ResponsiveContainer>}
    </div>
  );
}
