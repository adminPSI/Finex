const Constants = {
  KendoGrid: {
    defaultPageSize: 10,
  },
  FundTypeCode: {
    CashBalance: { code: 1, title: "Cash Balance" },
    Transfer: { code: 2, title: "Transfer" },
  },
  ExpenseOrRevenueIndicatorTypeCode: {
    RevenueIndicator: { code: 6, title: "Revenue" },
    ExpenseIndicator: { code: 7, title: "Expense" },
  },
  CountyExpenseAmountTypeCode: {
    Allocation: { code: 3, title: "Allocation" },
    Transfer: { code: 4, title: "Transfer" },
    Carryover: { code: 5, title: "Carryover" },
    AnticipatedRevenue: { code: 32, title: "Anticipated Revenue" },
  },
  IHACExpenseAmountTypeCode: {
    Allocation: { code: 12, title: "Allocation" },
    Transfer: { code: 13, title: "Transfer" },
    Carryover: { code: 14, title: "Carryover" },
  }
};

export default Constants;
