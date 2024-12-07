import React, { useState } from "react";
import ProductSelector from "./components/ProductSelector";


function App() {
  const [initialSelectedProducts, setInitialSelectedProducts] = useState([]); // State in parent to hold selected product
  
  const handleProductsUpdate = (products) => {
    setInitialSelectedProducts(products); // Update selected products
  };

  console.log('selectedProduct',initialSelectedProducts)

  return (
    <div className="App">
      <h1>Monk Commerce Product Selection</h1>
      <ProductSelector   initialSelectedProducts={initialSelectedProducts}
        onUpdateProducts={handleProductsUpdate} /> {/* Pass callback */}

    </div>
  );
}

export default App;
