import { AccountBankDetail } from "./accountBankDetail"
import { FkAccountType } from "./accountTypes"
import { Bill } from "./bill"
import { ItemSaleDetail } from "./itemSaleDetail"

export interface Account {
    id: number //added by me
    accountId:number
    accountNo: number
    accountFirmName: string
    accountFirmNameHindi: string
    accountSortName: string
    accountHolderDetail: string
    fkAccountTypeId: number //id from accountType 
    accountCode: string
    accountFirmCode: string
    fkVillageId: number   //from village
    accountName: string
    accountNameHindi: string
    accountMobileNo: string
    accountPhoneNo: string
    accountAddress1: string
    accountAddress2: string
    accountCity: string
    accountState: string
    accountZip: string
    accountPanNo: string
    isShowonPage: string
    fkBranchId: number
    isActive: string
    insertDate: string
    modifyDate: string
    createdBy: number
    modifiedBy: number
    licenceNo: string
    emailId: string
    sysdate: string
    fkBankAccountId: number
    fkAccountBankDetailId: number
    remark: string
    accountType:string //added by me
    accountBankDetails: AccountBankDetail[]
    // accountTransactions: AccountTransaction[]
    bills: Bill[]
    // cashBooks: CashBook[]
    fkAccountType: FkAccountType
    itemSaleDetails: ItemSaleDetail[]
    // itemSaleRateDiffs: ItemSaleRateDiff2[]
    // manageCarats: ManageCarat[]
    // manageHammalis: ManageHammali[]
    // manageStocks: ManageStock[]
  }