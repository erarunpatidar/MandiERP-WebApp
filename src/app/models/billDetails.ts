import { ItemWeightDetail } from "./itemWeightDetail"

export interface BillDetail {
    id: number
    billDetailNo: number
    billDetailCode: string
    fkBillId: number
    sno: number
    fkItemTypeId: number
    itemName: string  //Item
    fkItemUnitId: number
    itemUnit: string  //Unit
    itemMarca: string //Marca
    quantity: number  //Quantity 
    actualRate: number
    billRate: number
    weightDetails: string
    billWeightDetails: string
    grossWeight: number
    billGrossWeight: number // Total Wt in Bill)
    netWeight: number
    billNetWeight: number  //Net Wt in Bill
    saleTypeFixOrWeightBased: string
    commissionAmount: number  // Comm in Bill
    totalWeightCutting: number      //weight de
    totalHammali: number //added from Bill ?
    totalTulai: number  //added from Bill?
    totalKhadiKari: number
    actualTotalAmount: number //Total Amount
    billTotalAmount: number   //total amt + commAmt
    fkBranchId: number
    isActive: string
    createBy: number
    createDate: string
    modifyBy: number
    modifyDate: string
    commissionPercent: number   //commission
    sysdate: string
    avgWeight: number
    commissionPercentS: number
    commissionAmountS: number
    avgRate: number
    paidAmount: number
    discount: number
    remainingAmount: number
    isPanaPaid: boolean
    fkBill: string
    itemSaleDetails: string[]
    itemWeightDetails: ItemWeightDetail[]
  }