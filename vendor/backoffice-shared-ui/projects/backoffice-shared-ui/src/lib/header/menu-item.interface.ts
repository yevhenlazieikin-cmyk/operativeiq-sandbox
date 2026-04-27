export interface MenuItem {
  Id: number;
  PageName: string;
  PageCode: string;
  PageUrl: string;
  SortOrder: number;
  Children?: MenuItem[]; // Recursive definition
}
