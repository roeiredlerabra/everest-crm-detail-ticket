import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Settings, MoreHorizontal, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const API_URL = 'https://prod-107.westeurope.logic.azure.com:443/workflows/cb9d7554d3c841f0983f363221c50413/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=zK-nPFwO6OpBFhbTsiptapo79_ZSgw4dOPQNAkYy2ks';

const Dashboard = () => {
  const [issueData, setIssueData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIssueData();
  }, []);

  const fetchIssueData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIssueData(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching issue data:', error);
      setError('Failed to fetch issue data. Please try again later.');
      setIsLoading(false);
    }
  };

  const getTaskCounts = () => {
    const counts = { unassigned: 0, inProgress: 0, completed: 0 };
    issueData.forEach(issue => {
      if (!issue.Assignedto0?.DisplayName) counts.unassigned++;
      else if (issue.Status?.Value === 'Completed') counts.completed++;
      else counts.inProgress++;
    });
    return counts;
  };

  const getAssignedTasks = () => {
    return issueData
      .filter(issue => issue.Assignedto0?.DisplayName)
      .slice(0, 4)
      .map(issue => ({
        id: issue.id,
        title: issue.Title,
        time: new Date(issue.DateReported).toLocaleDateString(),
        progress: Math.random() * 100, // Placeholder: replace with actual progress data if available
        avatar: '/api/placeholder/32/32'
      }));
  };

  const getDailyTasksData = () => {
    const last5Days = [...Array(5)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last5Days.map(date => ({
      name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      completed: issueData.filter(issue => 
        issue.DateReported.startsWith(date) && issue.Status?.Value === 'Completed'
      ).length
    }));
  };

  const getWorkloadByStatus = () => {
    const statusCounts = issueData.reduce((acc, issue) => {
      const status = issue.Status?.Value || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };

  const taskCounts = getTaskCounts();
  const assignedTasks = getAssignedTasks();
  const dailyTasksData = getDailyTasksData();
  const workloadData = getWorkloadByStatus();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4 bg-purple-600 min-h-screen">
      <div className="bg-white rounded-lg p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Dashboard /</span>
            <span className="font-semibold">Issue Tracking Dashboard</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Hide · 5
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Customize
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(taskCounts).map(([key, value]) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </CardTitle>
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-gray-500">issues</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedTasks.map((task) => (
                <div key={task.id} className="flex items-center mb-4">
                  <img src={task.avatar} alt="Avatar" className="w-8 h-8 rounded-full mr-3" />
                  <div className="flex-grow">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-sm text-gray-500">{task.time}</div>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Completed Issues</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTasksData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Line type="monotone" dataKey="completed" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issues by Priority</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueData.map(issue => ({ priority: issue.Priority?.Value, count: 1 }))}>
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {issueData.slice(0, 3).map((issue, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold">{issue.Title}</div>
                  <div className="text-sm text-gray-500">
                    Updated: {new Date(issue.DateReported).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issues by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workloadData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {workloadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;