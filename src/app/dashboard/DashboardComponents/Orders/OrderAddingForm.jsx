"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import ToggleSwitch from "@/Components/UI/ToggleSwitch";
import FormInputField from "@/Components/UI/FormInputField";
import FormSelectField from "@/Components/UI/FormSelectField";
import { useConfig } from "@/Contexts/ConfigContext";
import { uploadToS3 } from "@/utils/uploadToS3";
// import incoTermsData from "@/Data/incoTerms.json";
// import paymentTermsData from "@/Data/paymentTerms.json";
// import packagingData from "@/Data/packagings.json";
// import { useDashBoard } from "@/Contexts/DashBoardContext";

const OrderAddingForm = ({ setShowForm }) => {
  const { paymentTermsData, currencyData, incoTermsData, packagingData } =
    useConfig();

  const [poNumber, setPoNumber] = useState("");
  const [poFile, setPoFile] = useState(null);
  const [incoTerms, setIcoTerms] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [poFileString, setPoFileString] = useState("");
  const [orderDate, setOrderDate] = useState(Date.now());
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [orderType, setOrderType] = useState("Domestic");
  const [consignments, setConsignments] = useState([]);
  const [currency, setCurrency] = useState(currencyData[0]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState(Date.now());
  const [singleConsignment, setSingleConsignment] = useState(true);
  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const customerRes = await axios.get("/api/customer");
      const productRes = await axios.get("/api/product");
      setCustomers(customerRes.data);
      setProducts(productRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate total amount
  const calculateTotal = (items) => {
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    setTotal(totalAmount);
  };

  useEffect(() => {
    calculateTotal(orderItems);
  }, [orderItems]);

  const validateQuantities = () => {
    const updatedQuantities = {};
    orderItems.forEach((item) => {
      updatedQuantities[item.product] = item.initialQuantity;
    });

    consignments.forEach((consignment) => {
      consignment.consignmentItems.forEach(
        ({ product, dispatchedQuantity }) => {
          if (updatedQuantities[product] !== undefined) {
            updatedQuantities[product] -= dispatchedQuantity;
          }
        }
      );
    });

    const isValidState = Object.values(updatedQuantities).every(
      (qty) => qty === 0
    );
    return isValidState;
  };

  // Submit the order
  const submitOrder = async () => {
    try {
      const poFileUrl = poFile ? await uploadToS3(poFile) : null;
      console.log(poFileUrl);
      var consignmentData = [];
      if (singleConsignment) {
        const consignmentItems = orderItems.map((item) => ({
          product: item.product,
          dispatchedQuantity: item.initialQuantity,
        }));
        consignmentData = [{ deliveryDate, consignmentItems }];
      } else {
        consignmentData = consignments.map((consignment) => ({
          deliveryDate: consignment.deliveryDate,
          consignmentItems: consignment.consignmentItems.map((item) => ({
            product: item.product,
            dispatchedQuantity: item.dispatchedQuantity,
          })),
        }));
      }
      if (singleConsignment) {
        if (!deliveryDate) {
          alert("Please select a delivery date.");
          return;
        }
      } else if (!validateQuantities()) {
        alert("Quantities do not match ordered values.");
        return;
      }

      const order = {
        poNumber,
        poFile: poFileUrl,
        incoTerms,
        paymentTerms,
        orderDate,
        singleConsignment,
        orderType,
        consignments: consignmentData,
        customer: selectedCustomer,
        orderItems: orderItems,
        currency: currency,
        deliveryDate,
        total,
      };

      await axios.post("/api/order", order);
      alert("Order added successfully!");
      setShowForm(false);
      window.location.reload();
    } catch (error) {
      console.error("Failed to add order:", error);
      alert("Failed to add order.");
    }
  };

  return !loading ? (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex h-screen py-5 items-center justify-center z-50">
        <div className="bg-white overflow-y-scroll h-full scroll-bar-hide flex-shrink p-6 rounded-lg shadow-lg w-full max-w-5xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Add New Order
          </h2>
          <div className="flex flex-col space-y-1 md:flex-row md:space-x-4 md:space-y-0">
            <FormInputField
              label="PO Number"
              inputType="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
            <FormInputField
              label="PO File"
              inputType="file"
              value={poFileString}
              onChange={(e) => {
                setPoFile(e.target.files[0]);
                setPoFileString(e.target.value);
              }}
            />
          </div>
          <div className="flex w-full flex-col md:flex-row gap-4">
            <FormSelectField
              name="ico-terms"
              label="INCO Terms"
              className={"flex-1"}
              value={incoTerms}
              onchange={(e) => setIcoTerms(e.target.value)}
              options={incoTermsData.map(({ term, definition }) => ({
                value: term,
                name: term,
              }))}
            />
            <FormSelectField
              name="payment-terms"
              label="Payment Terms"
              value={paymentTerms}
              className={"flex-1"}
              onchange={(e) => setPaymentTerms(e.target.value)}
              options={paymentTermsData.map(({ term, definition }) => ({
                value: term,
                name: term,
              }))}
            />
            <FormSelectField
              name={"currency"}
              value={JSON.stringify(currency)}
              className={"flex-1"}
              label={"Currency"}
              onchange={(e) => {
                setCurrency(JSON.parse(e.target.value));
              }}
              options={currencyData.map((currency) => ({
                name: `${currency.full_name} (${currency.shorthand})`,
                value: JSON.stringify(currency),
              }))}
            />
          </div>
          <FormInputField
            label="Order Date"
            inputType="date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
          />
          <FormSelectField
            name="orderType"
            label="Order Type"
            className={"flex-1"}
            value={orderType}
            onchange={(e) => setOrderType(e.target.value)}
            options={["Domestic", "Export"].map((term) => ({
              value: term,
              name: term,
            }))}
          />
          <FormSelectField
            name="customer"
            label="Select Customer"
            value={selectedCustomer}
            onchange={(e) => setSelectedCustomer(e.target.value)}
            options={customers.map((customer) => ({
              value: customer._id,
              name: customer.name,
            }))}
          />

          {/* Order Items */}
          <OrderItemAdditionModule
            {...{
              orderItems,
              products,
              setOrderItems,
              calculateTotal,
              packagingData,
              currency,
            }}
          />

          <ToggleSwitch
            name={"multi-consignment"}
            label="Deliver in Multiple Consignments"
            variable={singleConsignment}
            setVariable={setSingleConsignment}
          />

          {!singleConsignment ? (
            <ConsignmentAdditionModule
              {...{ consignments, orderItems, setConsignments }}
            />
          ) : (
            <FormInputField
              label="Delivery Date"
              inputType="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          )}

          {/* Total Amount */}
          <div className="mb-4">
            <p className="font-semibold text-lg text-gray-800">
              Total: {total.toFixed(2)} {currency.shorthand}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={submitOrder}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Add Order
            </button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Loading...</h2>
        </div>
      </div>
    </>
  );
};

const OrderItemAdditionModule = ({
  orderItems,
  products,
  setOrderItems,
  calculateTotal,
  packagingData,
  currency,
}) => {
  // Add new product field
  const addProductField = () => {
    setOrderItems([
      ...orderItems,
      {
        product: "----",
        price: 0,
        quantity: 1,
        amount: 0,
        remark: "",
        initialQuantity: 0,
        productName: "----",
        packaging: "-----",
        noOfPackages: 1,
      },
    ]);
  };

  // Remove product field
  const removeProductField = (index) => {
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    calculateTotal(updatedItems);
  };

  // Handle product change and calculate the amount
  const handleProductChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    if (field === "quantity") {
      updatedItems[index].initialQuantity = value;
    }
    if (field === "product") {
      const product = products.find((product) => product._id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].packaging = product.packaging.term;
      }
    }
    updatedItems[index][field] = value;
    updatedItems[index].amount =
      (updatedItems[index].price || 0) * (updatedItems[index].quantity || 0);
    setOrderItems(updatedItems);
    calculateTotal(updatedItems);
  };
  return (
    <div className="mb-4 space-y-4">
      {orderItems.map((item, index) => (
        <div key={index} className="flex flex-wrap items-center ">
          <h1>Product {index + 1}</h1>
          <div className="flex md:flex-row flex-col w-full justify-center gap-4 flex-nowrap">
            <FormSelectField
              className={"flex-1"}
              name="product"
              label="Select Product"
              value={item.product}
              onchange={(e) =>
                handleProductChange(index, "product", e.target.value)
              }
              options={products.map((product) => ({
                value: product._id,
                name: product.name,
              }))}
            />

            <FormInputField
              label="Quantity"
              className={"flex-1"}
              inputType="number"
              value={item.initialQuantity}
              onChange={(e) =>
                handleProductChange(index, "quantity", parseInt(e.target.value))
              }
            />
            <FormSelectField
              name="packaging"
              label="Packaging"
              className={"flex-1"}
              value={item.packaging}
              onchange={(e) =>
                handleProductChange(index, "packaging", e.target.value)
              }
              options={packagingData.map(({ term, definition }) => ({
                value: term,
                name: term,
              }))}
            />
            <FormInputField
              label="No. of Packages"
              inputType="number"
              className={"flex-1"}
              value={item.noOfPackages}
              onChange={(e) =>
                handleProductChange(
                  index,
                  "noOfPackages",
                  parseInt(e.target.value)
                )
              }
            />
            <FormInputField
              label="Price"
              inputType="number"
              className={"flex-1"}
              value={item.price}
              onChange={(e) =>
                handleProductChange(index, "price", parseFloat(e.target.value))
              }
            />
          </div>
          <div className="flex p-0 md:flex-row flex-col w-full justify-center gap-4 flex-nowrap items-center">
            <FormInputField
              value={`${item.amount.toFixed(2)} ${currency.shorthand}`}
              onChange={() => {}}
              disabled={true}
              label={"Total"}
            />
            <FormInputField
              label="Remark"
              inputType="text"
              className={"flex-1"}
              value={item.remark}
              onChange={(e) =>
                handleProductChange(index, "remark", e.target.value)
              }
            />
            <button
              onClick={() => removeProductField(index)}
              className="p-2 pt-6 h-full flex justify-center items-center text-red-500 hover:text-red-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}
      <button
        onClick={addProductField}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Product
      </button>
    </div>
  );
};

const ConsignmentAdditionModule = ({
  consignments,
  setConsignments,
  orderItems,
}) => {
  const [isValid, setIsValid] = useState(true);
  const [remainingQuantities, setRemainingQuantities] = useState({});

  // **Initialize remaining quantities when orderItems are first loaded**
  useEffect(() => {
    const initialQuantities = {};
    orderItems.forEach((item) => {
      initialQuantities[item.product] = item.initialQuantity;
    });
    setRemainingQuantities(initialQuantities);
  }, [orderItems, consignments]);

  // **Recalculate Remaining Quantities when consignments change**
  useEffect(() => {
    const updatedQuantities = {};
    orderItems.forEach((item) => {
      updatedQuantities[item.product] = item.initialQuantity;
    });

    consignments.forEach((consignment) => {
      consignment.consignmentItems.forEach(
        ({ product, dispatchedQuantity }) => {
          if (updatedQuantities[product] !== undefined) {
            updatedQuantities[product] -= dispatchedQuantity;
          }
        }
      );
    });

    setRemainingQuantities(updatedQuantities);
    validateQuantities(updatedQuantities);
  }, [consignments, orderItems]);

  // **Validation Function to Check if All Quantities Match**
  const validateQuantities = (updatedQuantities) => {
    const isValidState = Object.values(updatedQuantities).every(
      (qty) => qty === 0
    );
    setIsValid(isValidState);
  };

  // **Add a New Consignment**
  const addConsignment = () => {
    setConsignments((prevConsignments) => [
      ...prevConsignments,
      { deliveryDate: "", consignmentItems: [] },
    ]);
  };

  // **Remove a Consignment**
  const removeConsignment = (index) => {
    setConsignments((prevConsignments) =>
      prevConsignments.filter((_, i) => i !== index)
    );
  };

  // **Add Product to a Consignment**
  const addConsignmentProduct = (consignmentIndex) => {
    setConsignments((prevConsignments) => {
      return prevConsignments.map((consignment, index) => {
        if (index === consignmentIndex) {
          return {
            ...consignment,
            consignmentItems: [
              ...consignment.consignmentItems,
              { product: "", dispatchedQuantity: 0 },
            ],
          };
        }
        return consignment;
      });
    });
  };

  // **Remove Product from a Consignment**
  const removeConsignmentProduct = (consignmentIndex, productIndex) => {
    setConsignments((prevConsignments) => {
      return prevConsignments.map((consignment, index) => {
        if (index === consignmentIndex) {
          return {
            ...consignment,
            consignmentItems: consignment.consignmentItems.filter(
              (_, i) => i !== productIndex
            ),
          };
        }
        return consignment;
      });
    });
  };

  // **Handle Consignment Updates**
  const handleConsignmentChange = (index, field, value) => {
    setConsignments((prevConsignments) => {
      return prevConsignments.map((consignment, i) =>
        i === index ? { ...consignment, [field]: value } : consignment
      );
    });
  };

  // **Handle Product Selection & Quantity in Consignment**
  const handleProductChange = (
    consignmentIndex,
    productIndex,
    field,
    value
  ) => {
    setConsignments((prevConsignments) => {
      return prevConsignments.map((consignment, index) => {
        if (index === consignmentIndex) {
          const updatedItems = consignment.consignmentItems.map((item, i) =>
            i === productIndex ? { ...item, [field]: value } : item
          );
          return { ...consignment, consignmentItems: updatedItems };
        }
        return consignment;
      });
    });
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-700">Consignments</h3>

      {/* Display Validation State */}
      <p
        className={`text-sm font-semibold ${
          isValid ? "text-green-600" : "text-red-600"
        }`}
      >
        {isValid
          ? "✅ All quantities match!"
          : "⚠️ Quantities do not match ordered values."}
      </p>

      {/* Consignments List */}
      {consignments.map((consignment, index) => (
        <div key={index} className="p-4 border rounded mb-4">
          <div className="flex items-center justify-between">
            <label className="font-semibold">Delivery Date:</label>
            <button
              onClick={() => removeConsignment(index)}
              className="text-red-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="date"
            value={consignment.deliveryDate}
            onChange={(e) =>
              handleConsignmentChange(index, "deliveryDate", e.target.value)
            }
            className="w-full p-2 border rounded mt-2"
          />

          {/* Products in Consignment */}
          {consignment.consignmentItems.map((item, productIndex) => (
            <div
              key={productIndex}
              className="flex items-center space-x-4 mt-3"
            >
              <select
                value={item.product}
                onChange={(e) =>
                  handleProductChange(
                    index,
                    productIndex,
                    "product",
                    e.target.value
                  )
                }
                className="w-1/3 p-2 border rounded"
              >
                <option value="">-- Select Product --</option>
                {orderItems
                  .filter(
                    (orderItem) =>
                      remainingQuantities[orderItem.product] > 0 ||
                      orderItem.product === item.product
                  )
                  .map((orderItem) => (
                    <option key={orderItem.product} value={orderItem.product}>
                      {orderItem.productName}
                    </option>
                  ))}
              </select>

              <input
                type="number"
                placeholder="Quantity"
                value={item.dispatchedQuantity}
                onChange={(e) => {
                  const quantity = parseInt(e.target.value);
                  handleProductChange(
                    index,
                    productIndex,
                    "dispatchedQuantity",
                    quantity
                  );
                }}
                className="w-1/4 p-2 border rounded"
              />

              <button
                onClick={() => removeConsignmentProduct(index, productIndex)}
                className="text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            onClick={() => addConsignmentProduct(index)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Product
          </button>
        </div>
      ))}

      {/* Add Consignment Button */}
      <button
        onClick={addConsignment}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
      >
        Add Consignment
      </button>
    </div>
  );
};

export default OrderAddingForm;
