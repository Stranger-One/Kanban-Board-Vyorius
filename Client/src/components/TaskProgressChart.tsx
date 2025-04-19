import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Task } from '../types/types';

export default function TaskProgressChart({ tasks }: { tasks: Task[] }) {
  const { barData, completionPercent } = getChartData(tasks);

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-2">Task Progress</h2>
      <p className="mb-2">✅ Completion: {completionPercent}%</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={barData}>
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#4ade80" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function getChartData(tasks : Task[]) {
  const columnCounts = {
    "To Do": 0,
    "In Progress": 0,
    "Done": 0
  };

  tasks.forEach(task => {
    columnCounts[task.status as keyof typeof columnCounts] += 1;
  });

  const totalTasks = tasks.length;
  const doneTasks = columnCounts["Done"];
  const completionPercent = totalTasks === 0 ? 0 : (doneTasks / totalTasks) * 100;

  return {
    barData: Object.entries(columnCounts).map(([status, count]) => ({ status, count })),
    completionPercent: completionPercent.toFixed(2)
  };
}
