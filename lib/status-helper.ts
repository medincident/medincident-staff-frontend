export const getStatusColor = (st: string) => {
  switch (st) {
    case "Зарегистрировано":
      return "bg-muted/50 text-muted-foreground border-border";
    case "В работе":
      return "bg-warning/15 text-warning border-warning/20";
    case "Выполнено":
      return "bg-success/15 text-success border-success/20";
    case "Отказано":
      return "bg-destructive/15 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};
