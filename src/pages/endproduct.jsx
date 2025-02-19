import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as FileSaver from "file-saver";
import { CSVLink } from "react-csv";

const db = getFirestore();
const auth = getAuth();

const meshDescriptions = {
  "40 Mesh":
    "Ideal for coarse materials, used in industrial sieving and filtration.",
  "60 Mesh": "Suitable for finer materials like powders or smaller particles.",
  "80 Mesh":
    "Used for medium fine filtration, often used in chemical processes.",
  "100 Mesh":
    "Provides finer filtration for precision materials and fine powders.",
};

const EndProduct = () => {
  const [endProducts, setEndProducts] = useState([
    { mesh: "40 Mesh", quantity: "", outgoingQuantity: "" },
    { mesh: "60 Mesh", quantity: "", outgoingQuantity: "" },
    { mesh: "80 Mesh", quantity: "", outgoingQuantity: "" },
    { mesh: "100 Mesh", quantity: "", outgoingQuantity: "" },
  ]);
  const [rawMaterial, setRawMaterial] = useState(""); // Raw material input
  const [existingRawMaterialStock, setExistingRawMaterialStock] = useState(0); // Existing stock of raw materials
  const [storedData, setStoredData] = useState([]); // Store the data
  const [selectedDate, setSelectedDate] = useState(""); // Selected date input
  const [startDateFilter, setStartDateFilter] = useState(""); // Start date for filtering
  const [endDateFilter, setEndDateFilter] = useState(""); // End date for filtering
  const [isButtonActive, setIsButtonActive] = useState(true); // Button active state
  const [buttonMessage, setButtonMessage] = useState(""); // Success or failure message for the button
  const [searchQuery, setSearchQuery] = useState(""); // Search query for filtering by mesh type

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    const userEmail = currentUser.email;
    const docRef = collection(
      db,
      "admins",
      userEmail,
      "End Product Quantities"
    );

    try {
      const querySnapshot = await getDocs(docRef);
      const allData = [];
      querySnapshot.forEach((doc) => {
        allData.push(doc.data());
      });
      setStoredData(allData); // Update state with all the records
    } catch (error) {
      console.error("Error fetching all data:", error);
      toast.error("Error fetching all stored data");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...endProducts];
    updatedProducts[index][field] = Number(value); // Ensure numeric value
    setEndProducts(updatedProducts);
  };

  const handleRawMaterialChange = (value) => {
    setRawMaterial(Number(value)); // Update raw material quantity
  };

  const handleExistingStockChange = (e) => {
    setExistingRawMaterialStock(Number(e.target.value)); // Update existing stock of raw material manually
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value); // Update selected date
  };

  const handleStartDateChange = (e) => {
    setStartDateFilter(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDateFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Set search query for filtering
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsButtonActive(false); // Disable the button during the process
    setButtonMessage("Updating... Please wait...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      setIsButtonActive(true); // Reactivate button
      setButtonMessage("Error: User not authenticated");
      return;
    }

    const userEmail = currentUser.email;
    const docRef = doc(
      db,
      "admins",
      userEmail,
      "End Product Quantities",
      selectedDate || "latest"
    ); // Use selected date for document ID or fallback to "latest"

    try {
      const docSnap = await getDoc(docRef);
      let updatedProducts = [...endProducts];
      let updatedRawMaterial = rawMaterial;

      if (docSnap.exists()) {
        const existingProducts = docSnap.data().products;
        const existingRawMaterial = docSnap.data().rawMaterial || 0;

        // Update product quantities by adding new quantities to existing ones
        updatedProducts = updatedProducts.map((product) => {
          const existingProduct = existingProducts.find(
            (p) => p.mesh === product.mesh
          );
          const newQuantity = Number(product.quantity);
          const outgoingQuantity = Number(product.outgoingQuantity);
          const existingQuantity = existingProduct
            ? Number(existingProduct.quantity)
            : 0; // Ensure numeric

          // Adjust the quantity by subtracting outgoing sales quantity
          const updatedQuantity =
            existingQuantity + newQuantity - outgoingQuantity;

          return {
            mesh: product.mesh,
            quantity: updatedQuantity, // Adjusted quantity after sales
            outgoingQuantity: outgoingQuantity, // Set outgoing quantity
          };
        });

        // Calculate the new existing raw material stock
        const totalRawMaterialUsed = updatedProducts.reduce((acc, product) => {
          const rawMaterialPerProduct = 1; // Define how much raw material is used per kg (can be changed)
          const quantityUsed =
            Number(product.outgoingQuantity) * rawMaterialPerProduct;
          return acc + quantityUsed;
        }, 0);

        updatedRawMaterial =
          existingRawMaterial + updatedRawMaterial - totalRawMaterialUsed;

        // Update the existing raw material stock manually and save it
        const updatedExistingStock =
          existingRawMaterialStock - totalRawMaterialUsed;

        // Store the updated stock and products, using merge to keep other fields intact
        await setDoc(
          docRef,
          {
            date: selectedDate || new Date().toISOString().split("T")[0], // Save the selected date
            products: updatedProducts,
            rawMaterial: updatedRawMaterial,
            existingRawMaterial: updatedExistingStock, // Save the updated raw material stock
          },
          { merge: true }
        ); // Use merge to avoid overwriting other fields

        toast.success(
          "End Product Quantities, Outgoing Sales, and Raw Material updated successfully!"
        );
        console.log("Updated data saved to Firestore:", updatedProducts);

        // Update the displayed existing raw material stock
        setExistingRawMaterialStock(updatedExistingStock);

        // Update the stored data with the new data
        setStoredData((prevData) => {
          const updatedData = prevData.filter(
            (data) => data.date !== selectedDate
          ); // Remove the existing data for that date
          updatedData.push({
            date: selectedDate || new Date().toISOString().split("T")[0],
            products: updatedProducts,
            rawMaterial: updatedRawMaterial,
          });
          return updatedData; // Add the updated data to the stored data
        });

        setIsButtonActive(true); // Reactivate button after successful update
        setButtonMessage("Update Successful!"); // Show success message
      }
    } catch (error) {
      toast.error("Error saving data");
      console.error("Error saving to Firestore:", error);
      setIsButtonActive(true); // Reactivate button on failure
      setButtonMessage("Error: Could not update data");
    }
  };

  // Filter data by date range and search query
  const filteredData = storedData.filter((data) => {
    const date = new Date(data.date);
    const startDate = startDateFilter ? new Date(startDateFilter) : null;
    const endDate = endDateFilter ? new Date(endDateFilter) : null;

    // Filter by date range
    const dateInRange =
      (!startDate || date >= startDate) && (!endDate || date <= endDate);

    // Filter by search query
    const searchMatch =
      searchQuery === "" ||
      data.products.some((product) =>
        product.mesh.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return dateInRange && searchMatch;
  });

  // Delete data by date
  const handleDelete = async (date) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    const userEmail = currentUser.email;
    const docRef = doc(db, "admins", userEmail, "End Product Quantities", date);

    try {
      await deleteDoc(docRef);
      setStoredData((prevData) =>
        prevData.filter((data) => data.date !== date)
      ); // Remove deleted data from the table
      toast.success("Data deleted successfully");
    } catch (error) {
      toast.error("Error deleting data");
      console.error("Error deleting data:", error);
    }
  };

  // Export data to CSV
  const handleExport = () => {
    const csvData = storedData.map((data) => {
      return {
        Date: data.date,
        "40 Mesh": data.products.find((p) => p.mesh === "40 Mesh")?.quantity,
        "60 Mesh": data.products.find((p) => p.mesh === "60 Mesh")?.quantity,
        "80 Mesh": data.products.find((p) => p.mesh === "80 Mesh")?.quantity,
        "100 Mesh": data.products.find((p) => p.mesh === "100 Mesh")?.quantity,
        RawMaterial: data.rawMaterial,
      };
    });

    const csvReport = {
      filename: "End_Product_Quantities.csv",
      headers: [
        { label: "Date", key: "Date" },
        { label: "40 Mesh", key: "40 Mesh" },
        { label: "60 Mesh", key: "60 Mesh" },
        { label: "80 Mesh", key: "80 Mesh" },
        { label: "100 Mesh", key: "100 Mesh" },
        { label: "Raw Material", key: "RawMaterial" },
      ],
      data: csvData,
    };

    FileSaver.saveAs(
      new Blob([JSON.stringify(csvReport)]),
      "End_Product_Quantities.csv"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 to-blue-300 p-8">
      <div className="max-w-8xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-800">
            End Product Management
          </h1>
          <FaShoppingCart className="text-2xl text-blue-700" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {/* Date Input */}
          <div className="mb-6">
            <label
              htmlFor="date"
              className="text-lg font-semibold text-gray-600"
            >
              Select Date:
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="mt-2 p-2 w-full border border-gray-300 rounded-md"
            />
          </div>

          {/* Date Range Filter and Search Bar in Same Row with Three Columns Layout */}
<div className="mb-6">
  <label className="text-lg font-semibold text-gray-600">
    Filter by Date Range:
  </label>
  <div className="flex gap-4 mt-2">
    <div className="flex-1">
      <label className="text-lg font-semibold text-gray-600">Start Date:</label>
      <input
        type="date"
        value={startDateFilter}
        onChange={handleStartDateChange}
        className="p-2 w-full border border-gray-300 rounded-md"
        placeholder="Start Date"
      />
    </div>
    <div className="flex-1">
      <label className="text-lg font-semibold text-gray-600">End Date:</label>
      <input
        type="date"
        value={endDateFilter}
        onChange={handleEndDateChange}
        className="p-2 w-full border border-gray-300 rounded-md"
        placeholder="End Date"
      />
    </div>
    <div className="flex-1">
      <label className="text-lg font-semibold text-gray-600">Search by Mesh:</label>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        className="p-2 w-full border border-gray-300 rounded-md mt-2"
        placeholder="Search by mesh type"
      />
    </div>
  </div>
</div>


          {/* End Product Form */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">
              Product Details
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {endProducts.map((product, index) => (
                <div key={index} className="p-4 border rounded-md shadow-md">
                  <label
                    htmlFor={`mesh-${product.mesh}`}
                    className="text-lg font-semibold text-gray-600"
                  >
                    {product.mesh}:
                  </label>
                  <input
                    type="number"
                    id={`mesh-${product.mesh}`}
                    value={product.quantity}
                    onChange={(e) =>
                      handleInputChange(index, "quantity", e.target.value)
                    }
                    className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                    placeholder="Enter Quantity (kg)"
                  />
                  <input
                    type="number"
                    id={`outgoing-${product.mesh}`}
                    value={product.outgoingQuantity}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "outgoingQuantity",
                        e.target.value
                      )
                    }
                    className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                    placeholder="Enter Outgoing Sales Quantity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Raw Material Form (Two Columns Layout) */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Raw Material Quantity
              </h2>
              <div className="p-4 border rounded-md shadow-md mt-4">
                <input
                  type="number"
                  id="rawMaterial"
                  value={rawMaterial}
                  onChange={(e) => handleRawMaterialChange(e.target.value)}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Enter Raw Material Quantity"
                />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Existing Raw Material Stock
              </h2>
              <div className="p-4 border rounded-md shadow-md mt-4">
                <input
                  type="number"
                  value={existingRawMaterialStock}
                  onChange={handleExistingStockChange}
                  className="mt-2 p-2 w-full border border-gray-300 rounded-md"
                  placeholder="Enter Existing Raw Material Stock"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="text-center flex gap-4 justify-center">
            {/* Update Quantities Button */}
            <button
              type="submit"
              disabled={!isButtonActive}
              className={`${
                isButtonActive ? "bg-blue-600" : "bg-gray-400"
              } text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition duration-300`}
            >
              {isButtonActive ? "Update Quantities" : "Updating..."}
            </button>

            {/* Update Raw Material Button */}
            <button
              type="button"
              onClick={handleSubmit} // Add a new handler for raw material update
              disabled={!isButtonActive}
              className={`${
                isButtonActive ? "bg-yellow-600" : "bg-gray-400"
              } text-white py-3 px-6 rounded-lg hover:bg-yellow-500 transition duration-300`}
            >
              {isButtonActive
                ? "Update Raw Material"
                : "Updating Raw Material..."}
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-500 transition duration-300"
            >
              Export Data to CSV
            </button>
          </div>
        </form>

        {/* Stored Data Table */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">
            Stored Data for{" "}
            {selectedDate || new Date().toISOString().split("T")[0]}
          </h2>
          <table className="w-full table-auto border-collapse text-gray-600">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-4">Date</th>
                <th className="p-4">40-Mesh</th>
                <th className="p-4">60-Mesh</th>
                <th className="p-4">80-Mesh</th>
                <th className="p-4">100-Mesh</th>
                <th className="p-4">Raw Material</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((data, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="p-4">{data.date}</td>
                    {data.products.map((product, pIndex) => (
                      <td key={pIndex} className="p-4">
                        {product.mesh}: {product.quantity} kg
                        <p className="text-sm text-gray-500">
                          Outgoing: {product.outgoingQuantity} kg
                        </p>
                      </td>
                    ))}
                    <td className="p-4">{data.rawMaterial} kg</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDelete(data.date)}
                        className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EndProduct;
