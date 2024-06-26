import axios, { AxiosResponse, AxiosError } from 'axios';
import { BASE_URL } from '../../settings';

// Define the base URL of your API
axios.defaults.baseURL = BASE_URL;

const responseBody = (response: AxiosResponse) => response.data;


// Define your API methods
const requests = {
    get: (url: string, params?: URLSearchParams) => {
        try {
          const response = axios.get(url, {
            params: {
            },
          });
          return response; // Return the Axios response directly
        } catch (error) {
          throw error as AxiosError;
        }
      },
    // get: (url: string, body:{}) => axios.get(url).then( responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
    patch: (url: string, body: {}) => axios.patch(url, body).then(responseBody),
}

const Village = {
    // getVillage: (page?:number, pageSize?:number) => requests.get(`/villages?_page=${page}&_limit=${pageSize}`),
    getVillage: () => requests.get('/villages'),
    createVillage: (data: any) => requests.post('/villages', data),
    updateVillage: (id:number,data: any) => requests.put(`/villages/${id}`, data),
    deleteVillage: (id: number) => requests.delete(`/villages/${id}`)
}

const Item = {
  getItem: () => requests.get('/items'),
  createItem: (data: any) => requests.post('/items', data),
  updateItem: (id:number,data: any) => requests.put(`/items/${id}`, data),
  deleteItem: (id: number) => requests.delete(`/items/${id}`)
}

const Unit = {
  getUnit: () => requests.get('/units'),
  createUnit: (data: any) => requests.post('/units', data),
  updateUnit: (id:number,data: any) => requests.put(`/units/${id}`, data),
  deleteUnit: (id: number) => requests.delete(`/units/${id}`)
}

const Account = {
  getAccount: () => requests.get('/accounts'),
  createAccount: (data: any) => requests.post('/accounts', data),
  updateAccount: (id:number,data: any) => requests.put(`/accounts/${id}`, data),
  deleteAccount: (id: number) => requests.delete(`/accounts/${id}`)
}

const AccountBankDetail = {
  getAccountBankDetail: () => requests.get('/accountBankDetails'),
  createAccountBankDetail: (data: any) => requests.post('/accountBankDetails', data),
  updateAccountBankDetail: (id:number,data: any) => requests.put(`/accountBankDetails/${id}`, data),
  deleteAccountBankDetail: (id: number) => requests.delete(`/accountBankDetails/${id}`)
}

const AccountTpes = {
  getAccountType: () => requests.get('/accountTypes'),
  createAccounTypest: (data: any) => requests.post('/accountTypes', data),
}

const Bill = {
  getBill: () => requests.get('/bills'),
  createBill: (data: any) => requests.post('/bills', data),
  updateBill: (id:number,data: any) => requests.put(`/bills/${id}`, data),
  deleteBill: (id: number) => requests.delete(`/bills/${id}`)
}

const BillDetail = {
  getBillDetail: () => requests.get('/billDetails'),
  createBillDetail: (data: any) => requests.post('/billDetails', data),
  updateBillDetail: (id:number,data: any) => requests.put(`/billDetails/${id}`, data),
  updatedBillDetail: (id: number, data: any) => requests.patch(`/billDetails/${id}`, data),
  deleteBillDetails: (id: number) => requests.delete(`/billDetails/${id}`)
}
const ItemSaleDetail = {
  getItemSaleDetail: () => requests.get('/itemSaleDetails'),
  createItemSaleDetail: (data: any) => requests.post('/itemSaleDetails', data),
  updateItemSaleDetail: (id:number,data: any) => requests.put(`/itemSaleDetails/${id}`, data),
  deleteItemSaleDetail: (id: number) => requests.delete(`/itemSaleDetails/${id}`),
}
const GadiMasters = {
  getGadiMasters: () => requests.get('/gadiMasters'),
  createGadiMasters: (data: any) => requests.post('/gadiMasters', data),
}

const api = {
    Village,
    Item,
    Unit,
    Account,
    AccountBankDetail,
    AccountTpes,
    Bill,
    BillDetail,
    ItemSaleDetail,
    GadiMasters
}

export default api;