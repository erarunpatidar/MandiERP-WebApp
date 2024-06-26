import { Pagination, TablePagination } from "@mui/material";
// import { fetchVillagesAsync, setPageNumber, setRowsPerPage, villageSelectors } from "../../features/village/villageSlice";
import { useAppDispatch, useAppSelector } from "../store/configureStore";
import { useState } from "react";

interface PaginationProps {
  // currentPage: number;
  totalPages: number,
  currentPage:number,


  // onPageChange: (page: number) => void;
}

function AppPagination({totalPages, currentPage }: PaginationProps) {
  // const dispatch = useAppDispatch();
  const [ page, setPageNumber ] = useState(currentPage);

  

  // Get current page
  const handlePageChange = async (event: any, newPage: number) => {
    setPageNumber(newPage);
    // dispatch(fetchVillagesAsync({ page: newPage, pageSize: pageSize }));
  };

  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      color="primary"
      defaultPage={currentPage}
    />
  );
};
export default AppPagination;
// interface PaginationProps {
//   count: number,
//   currentPage:number,
//   rowsPerPage:number;
// }

// function AppPagination({count, currentPage, rowsPerPage}: PaginationProps) {
//   const dispatch = useAppDispatch();
//   // const {currentPage, rowsPerPage} = useAppSelector(state => state.village);
//   const [page, setPage] = useState(currentPage);
//   const [rowsperpage, setRowsPerPage] = useState(5);


//   // Get current page
//   const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
//     // setPage(newPage);
//     // dispatch(setPageNumber(newPage));
//     setPage(newPage);
//     console.log("current page: ", currentPage);
//   };

//   const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
//     // dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
//     // dispatch(setPageNumber(0));
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);

//   };
//   // const handlePageChange = async (event: any, newPage: number) => {
//   //       dispatch(setPageNumber(newPage));
//   //     };
//   return (
//     // <Pagination
//     //   count={count}
//     //   page={currentPage}
//     //   onChange={handlePageChange}
//     //   color="primary"
//     //   defaultPage={currentPage}
//     // />
//     <TablePagination
//         rowsPerPageOptions={[5, 10, 50, 100]}
//         count={count}
//         rowsPerPage={rowsPerPage}
//         page={currentPage}
//         onPageChange={handleChangePage}
//         onRowsPerPageChange={handleChangeRowsPerPage}
//         // defaultValue={currentPage}
//       />
//   );
// };
// export default AppPagination;