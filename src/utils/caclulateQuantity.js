export function calculateQuantity(order) {
  let orderItemsMap = {};

  // Initialize orderItemsMap with order quantities
  order.orderItems.forEach((item) => {
    orderItemsMap[item.product._id] = {
      name: item.product.name,
      orderedQuantity: item.quantity,
      deliveredQuantity: 0, // Default to 0, will be updated
    };
  });

  // Sum up delivered quantities from consignments
  order.consignments.forEach((consignment) => {
    consignment.consignmentItems.forEach((item) => {
      if (orderItemsMap[item.product._id]) {
        orderItemsMap[item.product._id].deliveredQuantity +=
          item.deliveredQuantity;
      }
    });
  });

  // Calculate remaining quantity
  Object.keys(orderItemsMap).forEach((productId) => {
    orderItemsMap[productId].remainingQuantity =
      orderItemsMap[productId].orderedQuantity -
      orderItemsMap[productId].deliveredQuantity;
  });

  return {
    ...order,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      deliveredQuantity: orderItemsMap[item.product._id].deliveredQuantity,
      remainingQuantity: orderItemsMap[item.product._id].remainingQuantity,
    })),
  };
}

// const order = {
//   _id: "67b5d95e6722e30ae13fa45a",
//   customer: {
//     _id: "67b440969ff08081238bd0ac",
//     name: "Mushan Khan",
//     email: "mushan@33-sol.com",
//     phone: "8624909744",
//     address: "Irsl colony 2 MIDC butibori nagpur",
//     gstNo: "GST12323",
//     msme: true,
//     city: "NAGPUR",
//     state: "Maharashtra",
//     createdAt: "2025-02-18T08:11:02.652Z",
//     updatedAt: "2025-02-18T08:11:02.652Z",
//     __v: 0,
//   },
//   poNumber: "PO-1233",
//   incoTerms: "Token",
//   orderDate: "2025-02-19T13:13:55.168Z",
//   orderItems: [
//     {
//       _id: "67b5d95e6722e30ae13fa45b",
//       orderId: "67b5d95e6722e30ae13fa45a",
//       product: {
//         _id: "67b5d8eb6722e30ae13fa44b",
//         name: "Lavanya Ka Maal",
//         casNumber: "Lavi-200",
//         description: "Doctors Brandy",
//         createdAt: "2025-02-19T13:13:15.591Z",
//         updatedAt: "2025-02-19T13:13:15.591Z",
//         __v: 0,
//       },
//       initialQuantity: 100,
//       quantity: 100,
//       packaging: "Standard Box",
//       noOfPackages: 10,
//       status: "Pending",
//       price: 10,
//       __v: 0,
//     },
//     {
//       _id: "67b5d95e6722e30ae13fa45c",
//       orderId: "67b5d95e6722e30ae13fa45a",
//       product: {
//         _id: "67b5d5e86722e30ae13fa447",
//         name: "Meth ( Ganjha )",
//         casNumber: "MET-124",
//         description: "No idea about the structure but feels good",
//         createdAt: "2025-02-19T13:00:24.348Z",
//         updatedAt: "2025-02-19T13:00:24.348Z",
//         __v: 0,
//       },
//       initialQuantity: 100,
//       quantity: 100,
//       packaging: "Small Drum",
//       noOfPackages: 5,
//       status: "Pending",
//       price: 130,
//       __v: 0,
//     },
//   ],
//   paymentTerms: "INCO",
//   singleConsignment: false,
//   consignments: [
//     {
//       _id: "67b5d95e6722e30ae13fa45f",
//       order: "67b5d95e6722e30ae13fa45a",
//       deliveryDate: "2025-02-21T00:00:00.000Z",
//       overallStatus: "complete",
//       consignmentItems: [
//         {
//           product: {
//             _id: "67b5d8eb6722e30ae13fa44b",
//             name: "Lavanya Ka Maal",
//             casNumber: "Lavi-200",
//             description: "Doctors Brandy",
//             createdAt: "2025-02-19T13:13:15.591Z",
//             updatedAt: "2025-02-19T13:13:15.591Z",
//             __v: 0,
//           },
//           status: "complete",
//           deliveredQuantity: 50,
//           dispatchedQuantity: 50,
//           _id: "67b5d95e6722e30ae13fa460",
//         },
//         {
//           product: {
//             _id: "67b5d5e86722e30ae13fa447",
//             name: "Meth ( Ganjha )",
//             casNumber: "MET-124",
//             description: "No idea about the structure but feels good",
//             createdAt: "2025-02-19T13:00:24.348Z",
//             updatedAt: "2025-02-19T13:00:24.348Z",
//             __v: 0,
//           },
//           status: "complete",
//           deliveredQuantity: 50,
//           dispatchedQuantity: 50,
//           _id: "67b5d95e6722e30ae13fa461",
//         },
//       ],
//       __v: 0,
//     },
//     {
//       _id: "67b5d95e6722e30ae13fa462",
//       order: "67b5d95e6722e30ae13fa45a",
//       deliveryDate: "2025-02-24T00:00:00.000Z",
//       overallStatus: "complete",
//       consignmentItems: [
//         {
//           product: {
//             _id: "67b5d8eb6722e30ae13fa44b",
//             name: "Lavanya Ka Maal",
//             casNumber: "Lavi-200",
//             description: "Doctors Brandy",
//             createdAt: "2025-02-19T13:13:15.591Z",
//             updatedAt: "2025-02-19T13:13:15.591Z",
//             __v: 0,
//           },
//           status: "complete",
//           deliveredQuantity: 50,
//           dispatchedQuantity: 50,
//           _id: "67b5d95e6722e30ae13fa463",
//         },
//       ],
//       __v: 0,
//     },
//     {
//       _id: "67b5d95e6722e30ae13fa464",
//       order: "67b5d95e6722e30ae13fa45a",
//       deliveryDate: "2025-02-26T00:00:00.000Z",
//       overallStatus: "complete",
//       consignmentItems: [
//         {
//           product: {
//             _id: "67b5d5e86722e30ae13fa447",
//             name: "Meth ( Ganjha )",
//             casNumber: "MET-124",
//             description: "No idea about the structure but feels good",
//             createdAt: "2025-02-19T13:00:24.348Z",
//             updatedAt: "2025-02-19T13:00:24.348Z",
//             __v: 0,
//           },
//           status: "complete",
//           deliveredQuantity: 50,
//           dispatchedQuantity: 50,
//           _id: "67b5d95e6722e30ae13fa465",
//         },
//       ],
//       __v: 0,
//     },
//   ],
//   deliveryDate: "2025-02-19T13:13:55.168Z",
//   total: 14000,
//   status: "complete",
//   createdAt: "2025-02-19T13:15:10.339Z",
//   updatedAt: "2025-02-19T14:12:48.713Z",
//   __v: 0,
// };

// // Example usage:
// const updatedOrder = calculateQuantity(order);
// console.log(JSON.stringify(updatedOrder, null, 2));
