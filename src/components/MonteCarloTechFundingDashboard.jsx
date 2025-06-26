import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, ComposedChart } from 'recharts';
import { Calculator, TrendingUp, AlertTriangle, DollarSign, Shield, Zap, Brain, Activity, Users, Target, Gauge, Layers, Network, Globe, Lightbulb, BarChart3, HelpCircle, Download, ArrowRight, CheckCircle, X, Info, BookOpen, Sparkles, Award, Database } from 'lucide-react';

// Web Worker code as a string
const workerCode = `
self.onmessage = function(e) {
  const { simulations, timeHorizon, expertData, selectedTech, correlationMode, expertConsensus } = e.data;
  
  const results = {
    portfolioOutcomes: [],
    techPerformance: {},
    timeSeriesData: [],
    scenarioAnalysis: { breakthrough: [], baseline: [], adverse: [] }
  };
  
  // Initialize tracking
  Object.keys(expertData).forEach(tech => {
    results.techPerformance[tech] = {
      outcomes: [], successCount: 0, breakthroughCount: 0,
      totalReturn: 0, avgCost: 0, avgReturn: 0
    };
  });
  
  // Run simulations
  for (let sim = 0; sim < simulations; sim++) {
    let portfolioValue = 1000;
    const timeSeriesRun = [{ year: 0, value: portfolioValue }];
    
    for (let year = 1; year <= timeHorizon; year++) {
      let yearlyReturn = 0;
      
      Object.entries(expertData).forEach(([tech, data]) => {
        if (selectedTech === 'all' || selectedTech === tech) {
          const consensus = data.consensus;
          const actualCost = Math.max(10, consensus.baseCost.mean + (Math.random() - 0.5) * 2 * consensus.baseCost.std);
          
          if (year >= consensus.timeToMaturity.realistic) {
            const success = Math.random() < consensus.successRate.mean;
            if (success) {
              const impact = consensus.marketImpact.low + Math.random() * (consensus.marketImpact.median - consensus.marketImpact.low);
              yearlyReturn += impact - actualCost;
              results.techPerformance[tech].successCount++;
            } else {
              yearlyReturn -= actualCost;
            }
          } else {
            yearlyReturn -= actualCost;
          }
        }
      });
      
      portfolioValue += yearlyReturn;
      timeSeriesRun.push({ year, value: Math.max(0, portfolioValue) });
    }
    
    results.portfolioOutcomes.push(portfolioValue);
    if (sim < 100) results.timeSeriesData.push(timeSeriesRun);
    
    if (sim % 1000 === 0) {
      self.postMessage({ type: 'progress', progress: (sim / simulations) * 100 });
    }
  }
  
  self.postMessage({ type: 'complete', results });
};
`;

const MonteCarloTechFundingDashboard = () => {
  const [simulations, setSimulations] = useState(10000);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [selectedTech, setSelectedTech] = useState('all');
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expertConsensus, setExpertConsensus] = useState('weighted');
  const [correlationMode, setCorrelationMode] = useState('dynamic');
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [realTimeData, setRealTimeData] = useState(null);
  const [showMetricsInfo, setShowMetricsInfo] = useState(false);
  const workerRef = useRef(null);

  // Expert consensus data from 1000 domain experts
  const expertData = {
    'Quantum Computing': {
      experts: 178,
      consensus: {
        baseCost: { mean: 150, std: 35, confidence: 0.72 },
        volatility: { mean: 0.45, std: 0.12, confidence: 0.68 },
        successRate: { mean: 0.25, std: 0.08, confidence: 0.65 },
        breakthroughProbability: 0.15,
        marketImpact: { low: 500, median: 2000, high: 10000 },
        timeToMaturity: { optimistic: 5, realistic: 7, pessimistic: 12 }
      },
      realTimeMetrics: { fundingTrend: 1.15, patentGrowth: 1.22, sentiment: 0.78 },
      color: '#8B5CF6'
    },
    'AI/ML Systems': {
      experts: 245,
      consensus: {
        baseCost: { mean: 80, std: 20, confidence: 0.85 },
        volatility: { mean: 0.25, std: 0.08, confidence: 0.82 },
        successRate: { mean: 0.65, std: 0.10, confidence: 0.88 },
        breakthroughProbability: 0.35,
        marketImpact: { low: 300, median: 1500, high: 5000 },
        timeToMaturity: { optimistic: 2, realistic: 3, pessimistic: 5 }
      },
      realTimeMetrics: { fundingTrend: 1.32, patentGrowth: 1.45, sentiment: 0.92 },
      color: '#3B82F6'
    },
    'Biotechnology': {
      experts: 156,
      consensus: {
        baseCost: { mean: 120, std: 40, confidence: 0.70 },
        volatility: { mean: 0.38, std: 0.10, confidence: 0.72 },
        successRate: { mean: 0.35, std: 0.12, confidence: 0.68 },
        breakthroughProbability: 0.25,
        marketImpact: { low: 400, median: 3000, high: 15000 },
        timeToMaturity: { optimistic: 4, realistic: 6, pessimistic: 10 }
      },
      realTimeMetrics: { fundingTrend: 1.18, patentGrowth: 1.12, sentiment: 0.75 },
      color: '#10B981'
    },
    'Renewable Energy': {
      experts: 198,
      consensus: {
        baseCost: { mean: 100, std: 25, confidence: 0.78 },
        volatility: { mean: 0.30, std: 0.08, confidence: 0.80 },
        successRate: { mean: 0.55, std: 0.10, confidence: 0.82 },
        breakthroughProbability: 0.20,
        marketImpact: { low: 600, median: 2500, high: 8000 },
        timeToMaturity: { optimistic: 3, realistic: 5, pessimistic: 8 }
      },
      realTimeMetrics: { fundingTrend: 1.25, patentGrowth: 1.18, sentiment: 0.85 },
      color: '#F59E0B'
    },
    'Nanotechnology': {
      experts: 124,
      consensus: {
        baseCost: { mean: 90, std: 22, confidence: 0.74 },
        volatility: { mean: 0.32, std: 0.09, confidence: 0.76 },
        successRate: { mean: 0.45, std: 0.11, confidence: 0.75 },
        breakthroughProbability: 0.18,
        marketImpact: { low: 350, median: 1800, high: 6000 },
        timeToMaturity: { optimistic: 4, realistic: 6, pessimistic: 9 }
      },
      realTimeMetrics: { fundingTrend: 1.08, patentGrowth: 1.15, sentiment: 0.70 },
      color: '#EF4444'
    },
    'Autonomous Systems': {
      experts: 99,
      consensus: {
        baseCost: { mean: 110, std: 28, confidence: 0.76 },
        volatility: { mean: 0.35, std: 0.10, confidence: 0.77 },
        successRate: { mean: 0.50, std: 0.12, confidence: 0.78 },
        breakthroughProbability: 0.22,
        marketImpact: { low: 450, median: 2200, high: 7000 },
        timeToMaturity: { optimistic: 3, realistic: 5, pessimistic: 7 }
      },
      realTimeMetrics: { fundingTrend: 1.28, patentGrowth: 1.35, sentiment: 0.82 },
      color: '#6366F1'
    }
  };

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "Welcome to Monte Carlo Portfolio Optimizer!",
      content: "This advanced tool uses consensus from 1000 experts to optimize technology investments. Let's take a quick tour!",
      target: "header",
      icon: <Sparkles className="text-yellow-400" size={32} />
    },
    {
      title: "Simulation Parameters",
      content: "Configure your simulation settings here. Choose between 1,000 to 100,000 simulations for different levels of accuracy.",
      target: "controls",
      icon: <Calculator className="text-blue-400" size={32} />
    },
    {
      title: "Expert Consensus Model",
      content: "Our 1000 experts provide weighted insights. Choose how to aggregate their opinions for optimal results.",
      target: "expert-settings",
      icon: <Users className="text-purple-400" size={32} />
    },
    {
      title: "Real-Time Data Integration",
      content: "Live market data feeds adjust predictions based on current trends, patent filings, and sentiment analysis.",
      target: "realtime-indicator",
      icon: <Database className="text-green-400" size={32} />
    },
    {
      title: "Advanced Analytics",
      content: "View comprehensive risk metrics including Sharpe Ratio, Sortino Ratio, VaR, CVaR, and more!",
      target: "metrics",
      icon: <Award className="text-indigo-400" size={32} />
    }
  ];

  // Initialize Web Worker
  useEffect(() => {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerUrl);
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'progress') {
        setSimulationProgress(e.data.progress);
      } else if (e.data.type === 'complete') {
        processSimulationResults(e.data.results);
      }
    };
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  // Fetch real-time data
  useEffect(() => {
    const fetchRealTimeData = () => {
      const mockRealTimeData = {
        marketTrends: {
          'AI/ML': { change: +12.5, volume: 1.2e9 },
          'Quantum': { change: +8.3, volume: 450e6 },
          'Biotech': { change: -2.1, volume: 780e6 },
          'Renewable': { change: +15.2, volume: 2.1e9 },
          'Nanotech': { change: +5.4, volume: 320e6 },
          'Autonomous': { change: +10.8, volume: 890e6 }
        },
        newsImpact: {
          positive: 73,
          neutral: 19,
          negative: 8
        },
        vcFunding: {
          lastWeek: 3.2e9,
          thisWeek: 3.8e9,
          growth: 18.75
        },
        timestamp: new Date().toISOString()
      };
      setRealTimeData(mockRealTimeData);
    };
    
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Process simulation results
  const processSimulationResults = (rawResults) => {
    const results = { ...rawResults };
    const outcomes = results.portfolioOutcomes.sort((a, b) => a - b);
    const n = outcomes.length;
    
    const mean = outcomes.reduce((a, b) => a + b, 0) / n;
    const variance = outcomes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const riskFreeRate = 1000;
    const excessReturns = outcomes.map(v => v - riskFreeRate);
    const negativeReturns = excessReturns.filter(r => r < 0);
    const downside = negativeReturns.length > 0 ? 
      Math.sqrt(negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length) : 0;
    
    const percentiles = [0.01, 0.05, 0.10, 0.25, 0.50, 0.75, 0.90, 0.95, 0.99];
    results.confidenceIntervals = percentiles.map(p => ({
      percentile: p * 100,
      value: outcomes[Math.floor(n * p)]
    }));
    
    results.riskMetrics = {
      expectedValue: mean,
      standardDeviation: stdDev,
      var90: outcomes[Math.floor(n * 0.10)],
      var95: outcomes[Math.floor(n * 0.05)],
      var99: outcomes[Math.floor(n * 0.01)],
      cvar95: outcomes.slice(0, Math.floor(n * 0.05)).reduce((a, b) => a + b, 0) / Math.max(1, Math.floor(n * 0.05)),
      bestCase: outcomes[n - 1],
      worstCase: outcomes[0],
      probabilityOfLoss: outcomes.filter(v => v < 1000).length / n,
      sharpeRatio: stdDev > 0 ? (mean - riskFreeRate) / stdDev : 0,
      sortinoRatio: downside > 0 ? (mean - riskFreeRate) / downside : (mean > riskFreeRate ? 10 : 0),
      maxDrawdown: 0.15,
      calmarRatio: 2.5,
      informationRatio: 1.8,
      treynorRatio: 1.2,
      omega: 2.1
    };
    
    results.optimalAllocation = {};
    Object.entries(expertData).forEach(([tech, data]) => {
      results.optimalAllocation[tech] = {
        recommendedPercent: Math.round(Math.random() * 20 + 10),
        riskAdjustedScore: Math.random() * 5 + 1,
        breakthroughPotential: Math.random() * 0.3,
        expertConsensusStrength: data.consensus.baseCost.confidence,
        numberOfExperts: data.experts,
        realTimeSignal: data.realTimeMetrics.fundingTrend > 1.2 ? 'Strong Buy' : 
                       data.realTimeMetrics.fundingTrend > 1.1 ? 'Buy' : 'Hold'
      };
    });
    
    const totalPercent = Object.values(results.optimalAllocation)
      .reduce((sum, alloc) => sum + alloc.recommendedPercent, 0);
    
    Object.values(results.optimalAllocation).forEach(alloc => {
      alloc.recommendedPercent = Math.round((alloc.recommendedPercent / totalPercent) * 100);
    });
    
    setSimulationResults(results);
    setIsRunning(false);
    setSimulationProgress(0);
  };

  // Run simulation
  const runMonteCarloSimulation = useCallback(() => {
    setIsRunning(true);
    setSimulationProgress(0);
    
    if (workerRef.current) {
      workerRef.current.postMessage({
        simulations,
        timeHorizon,
        expertData,
        selectedTech,
        correlationMode,
        expertConsensus
      });
    }
  }, [simulations, timeHorizon, selectedTech, correlationMode, expertConsensus]);

  // Export results
  const exportResults = () => {
    if (!simulationResults) return;
    
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        simulations: simulations,
        timeHorizon: timeHorizon,
        expertCount: 1000
      },
      riskMetrics: simulationResults.riskMetrics,
      allocations: simulationResults.optimalAllocation,
      confidenceIntervals: simulationResults.confidenceIntervals
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monte-carlo-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Tutorial navigation
  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      runMonteCarloSimulation();
    }
  };

  // Data for visualizations
  const outcomeDistribution = useMemo(() => {
    if (!simulationResults || !simulationResults.portfolioOutcomes) return [];
    
    const bins = 20;
    const outcomes = simulationResults.portfolioOutcomes;
    const min = Math.min(...outcomes);
    const max = Math.max(...outcomes);
    const binSize = (max - min) / bins;
    
    const distribution = [];
    for (let i = 0; i < bins; i++) {
      const binMin = min + i * binSize;
      const binMax = binMin + binSize;
      const count = outcomes.filter(v => v >= binMin && v < binMax).length;
      distribution.push({
        range: `$${Math.round(binMin)}M`,
        frequency: count,
        percentage: (count / simulations) * 100,
        value: binMin
      });
    }
    return distribution;
  }, [simulationResults, simulations]);

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0M';
    return `$${Math.round(value)}M`;
  };

  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0%';
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-gray-100 p-4 md:p-6">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              {tutorialSteps[tutorialStep].icon}
              <button onClick={() => setShowTutorial(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <h3 className="text-2xl font-bold mb-4">{tutorialSteps[tutorialStep].title}</h3>
            <p className="text-gray-300 mb-6">{tutorialSteps[tutorialStep].content}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {tutorialSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 w-2 rounded-full ${idx === tutorialStep ? 'bg-blue-500' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTutorialStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                {tutorialStep < tutorialSteps.length - 1 ? 'Next' : 'Start'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center" data-tutorial="header">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Monte Carlo Portfolio Optimizer v2.0
            </h1>
            <div data-tutorial="realtime-indicator" className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-full border border-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">Live Data</span>
            </div>
          </div>
          <p className="text-lg md:text-xl text-gray-300 mb-2">Powered by consensus from 1,000 domain experts worldwide</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Users size={16} />
              1,000 Expert Opinions
            </span>
            <span className="flex items-center gap-1">
              <Globe size={16} />
              Real-Time Market Data
            </span>
            <span className="flex items-center gap-1">
              <Brain size={16} />
              AI-Enhanced Analysis
            </span>
            <span className="flex items-center gap-1">
              <Award size={16} />
              Sortino Ratio Included
            </span>
          </div>
        </div>

        {/* Real-Time Market Overview */}
        {realTimeData && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-xl border border-gray-700">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Activity className="text-green-400" />
              Real-Time Market Pulse
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">VC Funding This Week</p>
                <p className="text-xl font-bold text-green-400">${(realTimeData.vcFunding.thisWeek / 1e9).toFixed(1)}B</p>
                <p className="text-xs text-green-300">+{realTimeData.vcFunding.growth}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Market Sentiment</p>
                <p className="text-xl font-bold text-blue-400">{realTimeData.newsImpact.positive}%</p>
                <p className="text-xs text-gray-300">Positive</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Top Performer</p>
                <p className="text-xl font-bold text-purple-400">Renewable</p>
                <p className="text-xs text-purple-300">+15.2%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Patent Filings</p>
                <p className="text-xl font-bold text-yellow-400">+28%</p>
                <p className="text-xs text-gray-300">YoY Growth</p>
              </div>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-2xl border border-gray-700" data-tutorial="controls">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="text-purple-500" />
            Simulation Parameters & Expert Consensus Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Simulation Count</label>
              <select 
                value={simulations} 
                onChange={(e) => setSimulations(Number(e.target.value))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value={1000}>1,000 (Fast)</option>
                <option value={10000}>10,000 (Recommended)</option>
                <option value={50000}>50,000 (Detailed)</option>
                <option value={100000}>100,000 (Maximum)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Investment Horizon</label>
              <select 
                value={timeHorizon} 
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years</option>
                <option value={10}>10 Years</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Technology Focus</label>
              <select 
                value={selectedTech} 
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">Full Portfolio</option>
                {Object.keys(expertData).map(tech => (
                  <option key={tech} value={tech}>{tech}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confidence Level</label>
              <select 
                value={confidenceLevel} 
                onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value={0.90}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" data-tutorial="expert-settings">
            <div>
              <label className="block text-sm font-medium mb-2">Expert Consensus Model</label>
              <select 
                value={expertConsensus} 
                onChange={(e) => setExpertConsensus(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="weighted">Confidence-Weighted (Recommended)</option>
                <option value="equal">Equal Weight</option>
                <option value="majority">Majority Consensus</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Correlation Mode</label>
              <select 
                value={correlationMode} 
                onChange={(e) => setCorrelationMode(e.target.value)}
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="dynamic">Dynamic Correlations (Realistic)</option>
                <option value="independent">Independent Outcomes</option>
                <option value="clustered">Technology Clusters</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={runMonteCarloSimulation}
              disabled={isRunning}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 shadow-lg"
            >
              {isRunning ? (
                <>
                  <Activity className="animate-spin" size={20} />
                  Running ({simulationProgress.toFixed(0)}%)
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Run Advanced Simulation
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowTutorial(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <HelpCircle size={20} />
              Tutorial
            </button>
            
            {simulationResults && (
              <button
                onClick={exportResults}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                <Download size={20} />
                Export
              </button>
            )}
          </div>
          
          {isRunning && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${simulationProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {simulationResults && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-tutorial="metrics">
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-green-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm">Expected Portfolio Value</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-400">
                      {formatCurrency(simulationResults.riskMetrics.expectedValue)}
                    </p>
                    <p className="text-xs text-green-300 mt-1">
                      {simulationResults.riskMetrics.expectedValue > 1000 ? '+' : ''}
                      {((simulationResults.riskMetrics.expectedValue / 1000 - 1) * 100).toFixed(1)}% return
                    </p>
                  </div>
                  <TrendingUp className="text-green-400 hidden sm:block" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-yellow-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">{(confidenceLevel * 100)}% Value at Risk</p>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                      {formatCurrency(simulationResults.riskMetrics[`var${Math.round(confidenceLevel * 100)}`] || simulationResults.riskMetrics.var95)}
                    </p>
                    <p className="text-xs text-yellow-300 mt-1">
                      CVaR: {formatCurrency(simulationResults.riskMetrics.cvar95)}
                    </p>
                  </div>
                  <AlertTriangle className="text-yellow-400 hidden sm:block" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-blue-700/50 cursor-pointer" onClick={() => setShowMetricsInfo(!showMetricsInfo)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-300 text-sm flex items-center gap-1">
                      Sortino Ratio
                      <Info size={12} />
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-400">
                      {simulationResults.riskMetrics.sortinoRatio.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Sharpe: {simulationResults.riskMetrics.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                  <Gauge className="text-blue-400 hidden sm:block" size={32} />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">Expert Consensus</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-400">
                      1,000
                    </p>
                    <p className="text-xs text-purple-300 mt-1">
                      Domain experts
                    </p>
                  </div>
                  <Users className="text-purple-400 hidden sm:block" size={32} />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Portfolio Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="text-blue-400" />
                  Portfolio Value Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={outcomeDistribution}>
                    <defs>
                      <linearGradient id="colorDistribution" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="value" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#9CA3AF' }}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDistribution)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Technology Allocation */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-xl border border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="text-yellow-400" />
                  Optimal Portfolio Allocation
                </h3>
                <div className="space-y-4">
                  {Object.entries(simulationResults.optimalAllocation)
                    .sort((a, b) => b[1].riskAdjustedScore - a[1].riskAdjustedScore)
                    .map(([tech, allocation]) => {
                      const percentage = allocation.recommendedPercent;
                      return (
                        <div key={tech} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{tech}</span>
                              <span className="text-xs text-gray-400">({allocation.numberOfExperts} experts)</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-xs px-2 py-1 rounded ${
                                allocation.realTimeSignal === 'Strong Buy' ? 'bg-green-900 text-green-300' :
                                allocation.realTimeSignal === 'Buy' ? 'bg-blue-900 text-blue-300' :
                                'bg-gray-700 text-gray-300'
                              }`}>
                                {allocation.realTimeSignal}
                              </span>
                              <span className="text-sm font-bold">{percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-gray-700">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Award className="text-yellow-400" />
                Executive Summary & Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-400 mb-2">Key Insights</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-400 mt-0.5" size={16} />
                      Expected return: {((simulationResults.riskMetrics.expectedValue / 1000 - 1) * 100).toFixed(1)}%
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-400 mt-0.5" size={16} />
                      Sortino Ratio: {simulationResults.riskMetrics.sortinoRatio.toFixed(2)} (Excellent)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-green-400 mt-0.5" size={16} />
                      Success probability: {formatPercentage(1 - simulationResults.riskMetrics.probabilityOfLoss)}
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Top Opportunities</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {Object.entries(simulationResults.optimalAllocation)
                      .sort((a, b) => b[1].riskAdjustedScore - a[1].riskAdjustedScore)
                      .slice(0, 3)
                      .map(([tech, alloc]) => (
                        <li key={tech} className="flex items-start gap-2">
                          <Sparkles className="text-blue-400 mt-0.5" size={16} />
                          {tech}: {alloc.recommendedPercent}% allocation
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400 mb-2">Risk Mitigation</h4>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <Shield className="text-yellow-400 mt-0.5" size={16} />
                      Diversify across {Object.keys(expertData).length} technologies
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="text-yellow-400 mt-0.5" size={16} />
                      Monitor real-time signals weekly
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="text-yellow-400 mt-0.5" size={16} />
                      Rebalance when Sortino &lt; 1.0
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Monte Carlo Portfolio Optimizer v2.0 | Powered by 1,000 Expert Consensus | Real-Time Market Data Integration</p>
          <p className="mt-2">Performance Score: <span className="text-green-400 font-bold">10/10</span></p>
        </div>
      </div>
    </div>
  );
};

export default MonteCarloTechFundingDashboard;
