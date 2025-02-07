import React, { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";

const EndProduct = () => {
  const [endProducts, setEndProducts] = useState([
    { mesh: "40 Mesh", quantity: 0 },
    { mesh: "60 Mesh", quantity: 0 },
    { mesh: "80 Mesh", quantity: 0 },
    { mesh: "100 Mesh", quantity: 0 },
  ]);

  const handleInputChange = (index, field, value) => {
    const updatedProducts = [...endProducts];
    updatedProducts[index][field] = value;
    setEndProducts(updatedProducts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can send the data to your database or handle it as needed
    console.log("EndProduct data submitted:", endProducts);
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
    </div>
  );
};

export default EndProduct;
