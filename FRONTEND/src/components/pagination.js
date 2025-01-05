import React from "react";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const MyPagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <PaginationItem active={i === currentPage} key={i}>
        <PaginationLink onClick={() => onPageChange(i)} href="#">
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return (
    <Pagination aria-label="Page navigation example">
      <PaginationItem disabled={currentPage <= 1}>
        <PaginationLink first href="#" onClick={() => onPageChange(1)} />
      </PaginationItem>
      <PaginationItem disabled={currentPage <= 1}>
        <PaginationLink
          previous
          href="#"
          onClick={() => onPageChange(currentPage - 1)}
        />
      </PaginationItem>
      {pages}
      <PaginationItem disabled={currentPage >= totalPages}>
        <PaginationLink
          next
          href="#"
          onClick={() => onPageChange(currentPage + 1)}
        />
      </PaginationItem>
      <PaginationItem disabled={currentPage >= totalPages}>
        <PaginationLink
          last
          href="#"
          onClick={() => onPageChange(totalPages)}
        />
      </PaginationItem>
    </Pagination>
  );
};

export default MyPagination;
