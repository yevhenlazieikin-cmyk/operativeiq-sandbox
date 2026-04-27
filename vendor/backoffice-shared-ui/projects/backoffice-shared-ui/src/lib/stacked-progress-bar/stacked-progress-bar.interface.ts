export interface StackedProgressBarItem {
  label: string;
  value: number;
  color: string;
  count?: number;
}

export interface StackedProgressBarConfig {
  title?: string;
  items: StackedProgressBarItem[];
  showPercentage?: boolean;
  showCounts?: boolean;
  showLegend?: boolean;
}
