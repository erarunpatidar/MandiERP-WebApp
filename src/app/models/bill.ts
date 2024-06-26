import { BillDetail } from "./billDetails"

export interface Bill {
    id: number  //added by me
    billId:number,
    billNo: number    //same value as id
    billCode: string
    billCodeDetail: string
    fkAccountId: number
    isCompanyAccount: string
    firmPhoneNo: string
    billRsvrPersonName: string  // Farmer Name (Person name from accounts)
    billRsvrPhoneNo: string     //Contact No.
    fkVillageId: number
    villageName: string   //Village
    billDate: string  //Date
    billPaidStatus: string //cash, Baki
    isBillPrint: string   //Bill On
    fkBillTypeId: number
    billType: string    //Bill Type
    fkGadiMasterId: number
    transPortName: string  //Transport
    gadiNo: string  //Gadi No
    isBhadaPaid: string   //isBhadaPaid
    gadiBhada: number     //gadiBhada
    previousBalance: number
    totalSevaSulk: number
    totalHammali: number  //Hammali 
    totalTulai: number    //Tulai
    totalKhadiKarai: number
    totalInam: number
    totalStationary: number //S
    totalPostageCharge: number
    totalOtherCharges: number
    totalPurchaseCommissionCharge: number
    totalQuantity: number   //Total Qty
    totalAmount: number     //Total Amount
    totalDeduction: number  //Exp Amount
    netAmount: number   //Net Amount , is changing
    paidAmount: number
    balanceAmount: number
    discount: number
    salesTax: number
    vatTax: number
    otherTax: number
    comments: string
    paymentMode: string
    billingAddress: string
    shipingAddress: string
    fkBranchId: number
    isActive: string
    createBy: number
    createDate: string
    modifyBy: number
    modifyDate: string
    sendBillToMandiOffice: string
    gateParchiNo: string
    anubandNo: string
    tolParchiNo: string
    other1: string
    other2: string
    other3: string
    other4: string
    other5: string
    anubandNoSn: string
    tolParchiNoSn: string
    bhugtanNo: string
    bhugtanNoSn: string
    bookNo: string
    sysdate: string
    aawakDate: string
    biltiNo: string
    addressDetail: string
    stateDetails: string
    billPrintType: string
    totalBarwai: number
    totalMaidanHammali: number
    totalPalaKarai: number
    totalThelaBhada: number
    totalBardan: number
    totalAdvance: number  //Advances
    totalOthersExp: number
    totalCommissionExp: number
    billDetails: BillDetail[]
    fkAccount: string       //Bank Account (from accountBankDetails)
  }