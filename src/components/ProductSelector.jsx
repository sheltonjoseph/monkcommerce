import React, { useState } from 'react';
import {
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  Link
} from '@mui/material';
import {
  DragIndicator as DragIndicatorIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import ProductSelectorDialog from './ProductSelectorDialog';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';


const ProductSelector = ({ initialSelectedProducts, onUpdateProducts }) => {
  const [productDiscounts, setProductDiscounts] = useState({});
  const [variantVisibility, setVariantVisibility] = useState({});
  const [open, setOpen] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const addDiscount = (productId, variantId = null) => {
    const discountKey = variantId ? `${productId}-${variantId}` : productId;
    setProductDiscounts(prev => ({
      ...prev,
      [discountKey]: { isActive: true, amount: '20', type: 'off' }
    }));
  };

  const toggleVariantVisibility = (productId) => {
    setVariantVisibility(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const updateDiscount = (productId, variantId = null, field, value) => {
    const discountKey = variantId ? `${productId}-${variantId}` : productId;
    setProductDiscounts(prev => ({
      ...prev,
      [discountKey]: {
        ...prev[discountKey],
        [field]: value
      }
    }));
  };


  const addNewProductBox = () => {
    const emptyProduct = {
      id: `temp-${Date.now()}`, // Temporary ID for the new product
      title: 'Select Product',
      variants: []
    };
    onUpdateProducts([...initialSelectedProducts, emptyProduct]);
  };

  const removeProduct = (productId) => {
    const updatedProducts = initialSelectedProducts.filter(
      product => product.id !== productId
    );
    onUpdateProducts(updatedProducts);
  };

  const removeVariant = (productId, variantId) => {
    const updatedProducts = initialSelectedProducts.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          variants: product.variants.filter(variant => variant.id !== variantId)
        };
      }
      return product;
    });
    onUpdateProducts(updatedProducts);
  };
  const handleProductsSelect = (products) => {
    onUpdateProducts(products);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
  };


  const handleDialogOpen = () => {
    setOpen(true);
  };

  const handleDragStart = (index) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index, type, productId = null) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    if (type === 'product') {
      const updatedProducts = Array.from(initialSelectedProducts);
      const [movedProduct] = updatedProducts.splice(draggedItemIndex, 1);
      updatedProducts.splice(index, 0, movedProduct);
      setDraggedItemIndex(null);
      onUpdateProducts(updatedProducts);
    } else if (type === 'variant' && productId !== null) {
      const product = initialSelectedProducts.find((p) => p.id === productId);
      const updatedVariants = Array.from(product.variants);
      const [movedVariant] = updatedVariants.splice(draggedItemIndex, 1);
      updatedVariants.splice(index, 0, movedVariant);

      const updatedProducts = initialSelectedProducts.map((p) =>
        p.id === productId ? { ...p, variants: updatedVariants } : p
      );
      setDraggedItemIndex(null);
      onUpdateProducts(updatedProducts);
    }
  };


  const renderDiscountSection = (productId, variantId = null) => {
    const discountKey = variantId ? `${productId}-${variantId}` : productId;
    const discount = productDiscounts[discountKey];

    return discount?.isActive ? (
      <>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Paper elevation={0} sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 20,
            height: '32px',
            width: '60px',
          }}>
            <TextField
              size="small"
              variant="standard"
              value={discount.amount}
              onChange={(e) => updateDiscount(productId, variantId, 'amount', e.target.value)}
              sx={{
                width: '40px',
                '& .MuiInput-input': {
                  px: 1.5,
                  fontSize: '14px',
                  textAlign: 'center'
                },
                '& .MuiInput-underline:before': { display: 'none' },
                '& .MuiInput-underline:after': { display: 'none' }
              }}
            />
          </Paper>

          <Paper elevation={0} sx={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 20,
            height: '32px',
            px: 1,
          }}>
            <Select
              value={discount.type}
              size="small"
              variant="standard"
              onChange={(e) => updateDiscount(productId, variantId, 'type', e.target.value)}
              sx={{
                '&:before': { display: 'none' },
                '&:after': { display: 'none' },
                '& .MuiSelect-select': {
                  py: 0,
                  px: 1,
                  fontSize: '14px'
                }
              }}
            >
              <MenuItem value="off">% Off</MenuItem>
              <MenuItem value="fixed">flat</MenuItem>
            </Select>
          </Paper>
        </Box>
      </>
    ) : (
      <>
        <Button
          variant="contained"
          color="success"
          size="small"
          sx={{
            height: '32px',
            textTransform: 'none',
            fontSize: '14px'
          }}
          onClick={() => addDiscount(productId, variantId)}
        >
          Add discount
        </Button>
      </>
    );
  };

  const renderVariants = (variants, productId) => (
    <Box sx={{ mt: 1 }}>
      {variants.map((variant, vIndex) => (
        <Box
          key={variant.id}
          draggable
          onDragStart={() => handleDragStart(vIndex)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(vIndex, 'variant', productId)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 3,
            mt: 1,
          }}
        >
          <DragIndicatorIcon
            sx={{
              color: 'text.secondary',
              cursor: 'move',
              fontSize: 20,
            }}
          />
          <Paper
            elevation={1} // Default elevation for normal MUI borders
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '32px',
              flex: 1,
              maxWidth: '250px',
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                color: 'text.primary',
                pl: 1.5,
                flex: 1,
              }}
            >
              {variant.title}
            </Typography>
          </Paper>
          {renderDiscountSection(productId, variant.id)}
          <IconButton size="small" onClick={() => removeVariant(productId, variant.id)}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );

  const renderProductBox = (product, index) => {
    // Ensure product is defined
    if (!product) {
      return null;
    }
  
    return (
      <Box
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={handleDragOver}
        onDrop={
          !variantVisibility[product.id]
            ? () => handleDrop(index, 'product')
            : undefined
        }
        sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <DragIndicatorIcon
            sx={{
              color: 'text.secondary',
              cursor: 'move',
              mt: 0.5,
              fontSize: 20,
            }}
          />
  
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  height: '32px',
                  flex: 1,
                  maxWidth: '250px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '14px',
                    color: 'text.primary',
                    pl: 1.5,
                    flex: 1,
                  }}
                >
                  {product.title || 'Select Product'}
                </Typography>
                <IconButton
                  size="small"
                  sx={{ mr: 0.5 }}
                  onClick={() => handleDialogOpen(product)}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Paper>
  
              {renderDiscountSection(product.id)}
              <IconButton
                size="small"
                onClick={() => removeProduct(product.id)}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
  
            {product.variants?.length > 0 && (
              <>
                <Box sx={{ ml: -2.5 }}>
                  <Link
                    component="button"
                    underline="hover"
                    onClick={() => toggleVariantVisibility(product.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '14px',
                      color: 'primary.main',
                    }}
                  >
                    {variantVisibility[product.id] ? 'Hide variants' : 'Show variants'}
                    <KeyboardArrowUpIcon
                      sx={{
                        fontSize: 18,
                        transform: variantVisibility[product.id] ? 'none' : 'rotate(180deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  </Link>
                </Box>
                {variantVisibility[product.id] &&
                  renderVariants(product.variants, product.id)}
              </>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {initialSelectedProducts.length === 0 ? (
        renderProductBox()
      ) : (
        initialSelectedProducts.map((product, index) => (
          <React.Fragment key={product?.id || index}>
            {renderProductBox(product, index)} {/* Render each product in the list */}
          </React.Fragment>
        ))
      )}

      <Button
        variant="outlined"
        color="success"
        sx={{ mt: 2, ml: 50 }}
        onClick={addNewProductBox}
      >
        Add Product
      </Button>

      {/* Keep the ProductSelectorDialog for when Edit icon is clicked */}
      <ProductSelectorDialog
        open={open}
        onClose={handleClose}
        initialSelectedProducts={initialSelectedProducts}
        onProductsSelect={handleProductsSelect}
      />
    </>
  );
};

export default ProductSelector;