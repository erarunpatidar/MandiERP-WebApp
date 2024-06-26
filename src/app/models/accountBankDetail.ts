export interface AccountBankDetail {
    id: number
    accountBankDetailNo: number
    fkAccountId: number
    bankAccountNo: string
    branchNo: string
    branchName: string
    ifscCode: string
    panNo: string
    accountHolderName: string
    detail: string
    comments: string
    isShowonPage: string
    fkBranchId: number
    isActive: string
    insertDate: string
    modifyDate: string
    createdBy: number
    modifiedBy: number
    sysdate: string
    fkAccount: string
  }