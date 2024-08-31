import React from 'react';
import { Pagination } from '@mui/material';

const PaginationComponent = ({ totalPages, currentPage, handlePageChange }) => {
  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      color="primary"
      variant="outlined"
      shape="round"
    />
  );
};

export default PaginationComponent;
