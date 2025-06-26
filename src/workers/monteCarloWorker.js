self.onmessage = ({ data: { assets, runs } }) => {
  const n = assets.length;
  const mu = Array(n).fill(0.08);
  const sigma = Array(n).fill(0.18);

  const out = [];
  for (let i = 0; i < runs; i++) {
    const w = Array.from({ length: n }, () => Math.random());
    const s = w.reduce((a, b) => a + b, 0);
    for (let k = 0; k < n; k++) w[k] /= s;

    const ret = w.reduce((sum, wk, k) => sum + wk * mu[k], 0);
    const vol = Math.sqrt(w.reduce((sum, wk, k) => sum + wk ** 2 * sigma[k] ** 2, 0));
    out.push({ ret, vol });
  }
  postMessage(out);
};
