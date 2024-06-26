export interface ItemSaleDetail {
    id: number
    itemSaleDetailNo: number
    itemSaleCode: string
    itemSaleCodeDetail: string
    fkAccountId: number
    phoneNo: string
    isCompanyAccount: string
    fkBillDetailId: number //billDetailId
    quantity: number  //Quantity (should be same as billdetail's qty?)
    rate: number    //Rate
    saleTypeFixOrWeightBased: string   //Sale Type
    grossWeight: number //GWt
    weightDetails: string //Weight Details
    netWeight: number //NetWt (should be same as Gwt?)
    commissionPercent: number //commission
    commissionAmount: number //CommAmt in table
    totalAmount: number
    fkBranchId: number
    isActive: string
    createBy: number
    createDate: string
    modifyBy: number
    modifyDate: string
    fkBillId: number
    remark: string  //Remark
    comment: string
    sysdate: string
    paidAmount: number
    discount: number
    remainingAmount: number
    isPanaPaid: boolean
    fkAccount: string     //Purchaser from accountBankDetails
    // fkBillDetail: FkBillDetail
    // itemSaleRateDiffs: ItemSaleRateDiff[]
  }