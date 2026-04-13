const getUpcomingDeadlines = (client) => {
  const today = new Date();
  const deadlines = [];

  // Example: GSTR-3B monthly (due 20th next month)
  for (let i = 0; i < 3; i++) {
    const date = new Date();
    //date.setMonth(date.getMonth() + i + 1);
    //date.setDate(today.getDate() + (i + 1));
    const offsets = [1, 3, 7];
    date.setDate(today.getDate() + offsets[i]);
    const diffTime = date - today;
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    deadlines.push({
      returnType: "GSTR-3B",
      period: `${date.getMonth() + 1}-${date.getFullYear()}`,
      dueDate: date,
      daysUntilDue,
    });
  }

  return deadlines.sort((a, b) => a.dueDate - b.dueDate);
};

const shouldAlert = (deadline) => {
  const d = deadline.daysUntilDue;
  return [7, 3, 1].includes(d) || d < 0;
};

module.exports = { getUpcomingDeadlines, shouldAlert };