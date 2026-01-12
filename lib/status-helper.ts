export const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  const common = "font-medium text-[12px]";

  if (["created", "new"].includes(s)) {
    return `${common} bg-muted text-muted-foreground border-border`;
  }

  if (["processed"].includes(s)) {
    return `${common} bg-info/15 text-info border-info/20`;
  }

  if (["in_work", "investigation"].includes(s)) {
    return `${common} bg-warning/15 text-warning border-warning/20`;
  }

  if (["purchase"].includes(s)) {
    return `${common} bg-purple/15 text-purple border-purple/20`;
  }

  if (["completed", "closed"].includes(s)) {
    return `${common} bg-success/15 text-success border-success/20`;
  }

  if (["refused", "cancelled"].includes(s)) {
    return `${common} bg-destructive/15 text-destructive border-destructive/20`;
  }

  return `${common} bg-muted text-muted-foreground`;
};

export const getPriorityColor = (priority: string) => {
  const p = priority.toLowerCase();
  const common = "font-medium text-[12px]";

  if (["critical", "severe"].includes(p)) {
    return `${common} bg-destructive/15 text-destructive border-destructive/20`;
  }

  if (["urgent", "moderate"].includes(p)) {
    return `${common} bg-warning/15 text-warning border-warning/20`;
  }

  if (["normal", "minor"].includes(p)) {
    return `${common} bg-info/15 text-info border-info/20`;
  }

  return `${common} bg-muted text-muted-foreground border-border`;
};
