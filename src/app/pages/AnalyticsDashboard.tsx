import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Download, Clock, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Medication Adherence Data - memoized to prevent re-creation
  const adherenceData = useMemo(() => [
    { id: 'mon', date: 'Mon', onTime: 6, late: 1, missed: 1 },
    { id: 'tue', date: 'Tue', onTime: 7, late: 0, missed: 1 },
    { id: 'wed', date: 'Wed', onTime: 8, late: 0, missed: 0 },
    { id: 'thu', date: 'Thu', onTime: 6, late: 2, missed: 0 },
    { id: 'fri', date: 'Fri', onTime: 7, late: 1, missed: 0 },
    { id: 'sat', date: 'Sat', onTime: 8, late: 0, missed: 0 },
    { id: 'sun', date: 'Sun', onTime: 7, late: 0, missed: 1 }
  ], []);

  // Compliance Rate Trend
  const complianceTrend = useMemo(() => [
    { id: 'w1', week: 'Week 1', rate: 87 },
    { id: 'w2', week: 'Week 2', rate: 91 },
    { id: 'w3', week: 'Week 3', rate: 89 },
    { id: 'w4', week: 'Week 4', rate: 94 }
  ], []);

  // Escalation Distribution
  const escalationData = useMemo(() => [
    { id: 'no-escalation', name: 'No Escalation', value: 156, color: '#10b981' },
    { id: 'level-1', name: 'Level 1', value: 18, color: '#f59e0b' },
    { id: 'level-2', name: 'Level 2', value: 4, color: '#ef4444' },
    { id: 'level-3', name: 'Level 3', value: 1, color: '#dc2626' }
  ], []);

  // Time of Day Analysis
  const timeOfDayData = useMemo(() => [
    { id: 'morning', time: 'Morning', adherence: 95 },
    { id: 'midday', time: 'Midday', adherence: 88 },
    { id: 'evening', time: 'Evening', adherence: 92 },
    { id: 'night', time: 'Night', adherence: 85 }
  ], []);

  // Activity Correlation
  const activityCorrelation = useMemo(() => [
    { id: 'mon-act', date: 'Mon', adherence: 88, activityMinutes: 45 },
    { id: 'tue-act', date: 'Tue', adherence: 92, activityMinutes: 60 },
    { id: 'wed-act', date: 'Wed', adherence: 95, activityMinutes: 75 },
    { id: 'thu-act', date: 'Thu', adherence: 85, activityMinutes: 30 },
    { id: 'fri-act', date: 'Fri', adherence: 90, activityMinutes: 50 },
    { id: 'sat-act', date: 'Sat', adherence: 94, activityMinutes: 80 },
    { id: 'sun-act', date: 'Sun', adherence: 88, activityMinutes: 40 }
  ], []);

  const totalDoses = 56;
  const onTimeDoses = 49;
  const lateDoses = 4;
  const missedDoses = 3;
  const adherenceRate = ((onTimeDoses / totalDoses) * 100).toFixed(1);
  const avgResponseTime = '4.2';

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analytics & Reporting</h1>
            <p className="text-slate-600 mt-1">Medication adherence insights and health outcomes</p>
          </div>
          
          <div className="flex gap-3">
            {/* Time Range Selector */}
            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
                    timeRange === range
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors">
              <Download size={18} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Overall Adherence */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Overall Adherence</h3>
              <CheckCircle size={20} className="text-emerald-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{adherenceRate}%</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-emerald-600 font-semibold">+5.2%</span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </div>

          {/* On-Time Doses */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">On-Time Doses</h3>
              <Clock size={20} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{onTimeDoses}/{totalDoses}</p>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-slate-500">{((onTimeDoses / totalDoses) * 100).toFixed(0)}% within window</span>
            </div>
          </div>

          {/* Average Response */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Avg Response Time</h3>
              <Activity size={20} className="text-indigo-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{avgResponseTime} min</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown size={16} className="text-emerald-600" />
              <span className="text-emerald-600 font-semibold">-1.3 min</span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </div>

          {/* Escalations */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-600">Total Escalations</h3>
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">23</p>
            <div className="flex items-center gap-1 text-sm">
              <TrendingDown size={16} className="text-emerald-600" />
              <span className="text-emerald-600 font-semibold">-12%</span>
              <span className="text-slate-500">vs last month</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Adherence Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Daily Adherence Breakdown</h3>
            <ResponsiveContainer key="adherence-chart" width="100%" height={300} minHeight={300}>
              <BarChart data={adherenceData} key="adherence-bar-chart">
                <CartesianGrid key="adherence-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis key="adherence-xaxis" dataKey="date" />
                <YAxis key="adherence-yaxis" />
                <Tooltip key="adherence-tooltip" />
                <Legend key="adherence-legend" />
                <Bar key="bar-onTime" dataKey="onTime" fill="#10b981" name="On Time" stackId="a" />
                <Bar key="bar-late" dataKey="late" fill="#f59e0b" name="Late" stackId="a" />
                <Bar key="bar-missed" dataKey="missed" fill="#ef4444" name="Missed" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Rate Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Compliance Rate Trend</h3>
            <ResponsiveContainer key="compliance-chart" width="100%" height={300} minHeight={300}>
              <LineChart data={complianceTrend} key="compliance-line-chart">
                <CartesianGrid key="compliance-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis key="compliance-xaxis" dataKey="week" />
                <YAxis key="compliance-yaxis" domain={[80, 100]} />
                <Tooltip key="compliance-tooltip" />
                <Legend key="compliance-legend" />
                <Line key="line-rate" type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={3} name="Adherence %" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Escalation Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Escalation Distribution</h3>
            <ResponsiveContainer key="escalation-chart" width="100%" height={300} minHeight={300}>
              <PieChart key="escalation-pie-chart">
                <Pie
                  key="escalation-pie"
                  data={escalationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {escalationData.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip key="escalation-tooltip" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Adherence by Time of Day */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Adherence by Time of Day</h3>
            <ResponsiveContainer key="timeofday-chart" width="100%" height={300} minHeight={300}>
              <BarChart data={timeOfDayData} key="timeofday-bar-chart">
                <CartesianGrid key="timeofday-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis key="timeofday-xaxis" dataKey="time" />
                <YAxis key="timeofday-yaxis" domain={[80, 100]} />
                <Tooltip key="timeofday-tooltip" />
                <Bar key="bar-adherence-time" dataKey="adherence" fill="#3b82f6" name="Adherence %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Correlation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="font-bold text-slate-900 mb-4">Activity & Adherence Correlation</h3>
          <ResponsiveContainer key="activity-chart" width="100%" height={300} minHeight={300}>
            <LineChart data={activityCorrelation} key="activity-line-chart">
              <CartesianGrid key="activity-grid" strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis key="activity-xaxis" dataKey="date" />
              <YAxis key="activity-yaxis-left" yAxisId="left" />
              <YAxis key="activity-yaxis-right" yAxisId="right" orientation="right" />
              <Tooltip key="activity-tooltip" />
              <Legend key="activity-legend" />
              <Line key="line-adherence-activity" yAxisId="left" type="monotone" dataKey="adherence" stroke="#10b981" strokeWidth={3} name="Adherence %" dot={{ r: 4 }} />
              <Line key="line-activity-minutes" yAxisId="right" type="monotone" dataKey="activityMinutes" stroke="#3b82f6" strokeWidth={3} name="Activity (min)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Insight:</strong> Medication adherence shows a positive correlation with daily activity levels (r=0.72). 
              Days with higher activity (60+ minutes) show 7% better adherence than low-activity days.
            </p>
          </div>
        </div>

        {/* RTM Billing Summary */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-xl mb-1">RTM Billing Summary</h3>
              <p className="text-indigo-100">Medicare reimbursement eligibility for {timeRange === '30d' ? 'this month' : 'selected period'}</p>
            </div>
            <Calendar size={32} className="text-indigo-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-100 mb-1">Monitoring Minutes</p>
              <p className="text-3xl font-bold">127 min</p>
              <p className="text-xs text-indigo-200 mt-1">10-20+ min required</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-100 mb-1">Eligible CPT Codes</p>
              <p className="text-3xl font-bold">98980, 98981</p>
              <p className="text-xs text-indigo-200 mt-1">Full tier qualified</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-100 mb-1">Estimated Reimbursement</p>
              <p className="text-3xl font-bold">$133</p>
              <p className="text-xs text-indigo-200 mt-1">Per patient/month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}