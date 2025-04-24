import React from 'react';
import { TableCell, Typography } from '@material-ui/core';

const InvestorInvestments = () => {
  // Assuming transaction data is stored in a state or props
  const transactions = [
    // Example transaction data
    {
      startupName: 'Startup A',
      investorName: 'Investor 1',
      investorDetails: {
        companyName: 'Investor Company 1'
      }
    },
    {
      startupName: 'Startup B',
      investorName: 'Investor 2',
      investorDetails: {
        companyName: 'Investor Company 2'
      }
    },
    {
      startupName: 'Startup C',
      investorName: 'Investor 3',
      investorDetails: {
        companyName: 'Investor Company 3'
      }
    }
  ];

  return (
    <div>
      {/* Assuming a table component is used to display transactions */}
      {transactions.map((transaction, index) => (
        <TableCell key={index}>
          {transaction.startupName || 'N/A'}
        </TableCell>
      ))}
      {transactions.map((transaction, index) => (
        <TableCell key={index}>
          {transaction.investorName || 'Unknown Investor'}
          {transaction.investorDetails?.companyName && (
            <Typography variant="caption" display="block" color="textSecondary">
              {transaction.investorDetails.companyName}
            </Typography>
          )}
        </TableCell>
      ))}
    </div>
  );
};

export default InvestorInvestments; 