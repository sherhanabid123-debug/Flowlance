import { format } from 'date-fns';

export function exportClientsToCSV(clients: any[]) {
  if (!clients || clients.length === 0) return;

  // Define headers
  const headers = [
    'Name',
    'Project Name',
    'Status',
    'Revenue (Budget/Final)',
    'Last Follow-up',
    'Next Follow-up',
    'Joined Date',
    'Notes'
  ];

  // Map rows
  const rows = clients.map(client => {
    // Determine revenue based on status
    let revenue = 0;
    if (client.status === 'potential') revenue = client.expectedBudget || 0;
    else if (client.status === 'confirmed') revenue = client.advanceAmount || 0;
    else if (client.status === 'completed') revenue = client.finalAmount || 0;

    return [
      `"${client.name.replace(/"/g, '""')}"`,
      `"${client.projectName.replace(/"/g, '""')}"`,
      client.status.toUpperCase(),
      revenue,
      client.lastFollowUp ? format(new Date(client.lastFollowUp), 'yyyy-MM-dd HH:mm') : 'N/A',
      client.nextFollowUp ? format(new Date(client.nextFollowUp), 'yyyy-MM-dd HH:mm') : 'N/A',
      format(new Date(client.createdAt), 'yyyy-MM-dd'),
      `"${(client.notes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
    ];
  });

  // Combine into CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create downloadable blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  link.setAttribute('href', url);
  link.setAttribute('download', `flowlance_clients_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
