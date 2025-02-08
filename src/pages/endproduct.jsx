import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore();
const auth = getAuth();

const EndProduct = () => {
  const [endProducts, setEndProducts] = useState([
    { mesh: "40 Mesh", quantity: "" },
    { mesh: "60 Mesh", quantity: "" },
    { mesh: "80 Mesh", quantity: "" },
    { mesh: "100 Mesh", quantity: "" },
  ]);
  const [storedProducts, setStoredProducts] = useState([]);

  useEffect(() => {
    fetchStoredProducts();
  }, []);

  const fetchStoredProducts = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    const userEmail = currentUser.email;
    const docRef = doc(db, "admins", userEmail, "End Product Quantities", "latest");

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStoredProducts(docSnap.data().products);
      } else {
        setStoredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching stored data");
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...endProducts];
    updatedProducts[index][field] = Number(value);  // Ensure numeric value
    setEndProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }
  
    const userEmail = currentUser.email;
    const docRef = doc(db, "admins", userEmail, "End Product Quantities", "latest");
  
    try {
      const docSnap = await getDoc(docRef);
      let updatedProducts = [...endProducts];
  
      if (docSnap.exists()) {
        const existingProducts = docSnap.data().products;
  
        updatedProducts = updatedProducts.map((product) => {
          const existingProduct = existingProducts.find((p) => p.mesh === product.mesh);
          const newQuantity = Number(product.quantity);
          const existingQuantity = existingProduct ? Number(existingProduct.quantity) : ""; // Ensure numeric
          
          return {
            mesh: product.mesh,
            quantity: existingQuantity + newQuantity, // Correct numeric addition
          };
        });
      }
  
      // Save updated quantities to Firestore
      await setDoc(docRef, { products: updatedProducts });
  
      toast.success("End Product Quantities updated successfully!");
      console.log("Updated data saved to Firestore:", updatedProducts);
  
      fetchStoredProducts(); // Refresh stored data
    } catch (error) {
      toast.error("Error saving data");
      console.error("Error saving to Firestore:", error);
    }
  };
  

  return (
    <div className="p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 bg-gradient-to-br from-blue-100 to-indigo-100 min-h-screen w-full">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-6 flex items-center">
        End Product Management
        <FaShoppingCart className="animate-drift ml-4" />
      </h1>

      <form onSubmit={handleSubmit}>
        {/* End Product Form */}
        <div className="bg-blue-900 p-6 rounded-md shadow-lg">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Product Details
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endProducts.map((product, index) => (
              <div key={index} className="bg-white p-4 rounded-md shadow-lg">
                <label
                  htmlFor={`mesh-${product.mesh}`}
                  className="text-lg font-semibold text-gray-700"
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
                  className="p-2 w-full mt-2 border border-gray-300 rounded-md"
                  placeholder="Enter Quantity (kg)"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            type="submit"
            className="bg-blue-900 text-white py-3 px-8 rounded-md hover:bg-blue-700 transition-all duration-300"
          >
            Update End Product Quantities
          </button>
        </div>
      </form>

      {/* Stored Data Table */}
      <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-3xl font-semibold text-blue-900 mb-4">Stored End Product Quantities</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border border-gray-300 p-2">Mesh</th>
              <th className="border border-gray-300 p-2">Quantity (kg)</th>
            </tr>
          </thead>
          <tbody>
            {storedProducts.length > 0 ? (
              storedProducts.map((product, index) => (
                <tr key={index} className="bg-gray-100 text-gray-700">
                  <td className="border border-gray-300 p-2">{product.mesh}</td>
                  <td className="border border-gray-300 p-2">{product.quantity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="border border-gray-300 p-2 text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EndProduct;
