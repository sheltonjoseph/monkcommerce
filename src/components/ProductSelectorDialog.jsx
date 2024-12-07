import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  Checkbox,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const ProductSelectorDialog = ({ open, onClose, initialSelectedProducts, onProductsSelect, }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState(initialSelectedProducts || []);
  const [products, setProducts] = useState([]); // State to hold fetched products
  const [page, setPage] = useState(0); // Track the current page
  const [hasMore, setHasMore] = useState(true); // Track if more products are available
  const observer = useRef();
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const searchTimeout = useRef(null);

  useEffect(() => {
    setPage(0);
    setProducts([]);
    setHasMore(true);
  }, [searchQuery]);



  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);

    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for debouncing
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchQuery(value);
      setPage(0); // Reset page when search changes
      setProducts([]); // Clear existing products
      setHasMore(true); // Reset hasMore flag
    }, 500); // 500ms delay
  };

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const searchParam = debouncedSearchQuery ? `&search=${encodeURIComponent(debouncedSearchQuery)}` : '';
        const response = await fetch(
          `https://stageapi.monkcommerce.app/task/products/search?page=${page}&limit=10${searchParam}`,
          {
            method: "GET",
            headers: {
              "x-api-key": "72njgfa948d9aS7gs5",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
          setHasMore(false);
        } else {
          setProducts(prevProducts =>
            page === 0 ? data : [...prevProducts, ...data]
          );
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, [page, debouncedSearchQuery]);


  const lastProductElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);



  // Helper function to get all variant IDs for a product
  const getVariantIds = (productId, productList) => {
    const product = productList?.find((product) => product.id === productId);
    return product?.variants.map((variant) => variant.id) || [];
  };

  // Helper function to get parent product ID for a variant
  // const getParentProductId = (variantId, productList) => {
  //   const parentProduct = productList?.find((product) =>
  //     product.variants.some((variant) => variant.id === variantId)
  //   );
  //   return parentProduct?.id || null;
  // };


  // Check if any variant of a product is selected
  const isAnyVariantSelected = (productId) => {
    const variantIds = getVariantIds(productId);
    return variantIds.some(id => selectedProducts.includes(id));
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh'
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        pb: 1
      }}>
        <Typography variant="h6">Select Products</Typography>
        <IconButton
          edge="end"
          onClick={onClose}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, pb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search product"
          value={searchQuery}
          onChange={handleSearchChange} // Use the new handler
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2 }}>
          {products.map((product, index) => (
            <Box key={product.id} sx={{ mb: 2 }} ref={index === products.length - 1 ? lastProductElementRef : null}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Checkbox
                  checked={selectedProducts.some((item) => item.id === product.id)}
                  indeterminate={
                    !selectedProducts.some((item) => item.id === product.id) && isAnyVariantSelected(product.id)
                  }
                  onChange={() => {
                    const isSelected = selectedProducts.some((item) => item.id === product.id);
                    if (isSelected) {
                      // Remove product and its variants
                      setSelectedProducts(prev => prev.filter(item => item.id !== product.id));
                    } else {
                      // Add product with all variants
                      setSelectedProducts(prev => [...prev, {
                        ...product,
                        variants: product.variants
                      }]);
                    }
                  }}
                  size="small"
                />
                <Box
                  component="img"
                  src={product.image.src}
                  alt={product.image.id}
                  sx={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 1 }}
                />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {product.title}
                </Typography>
              </Box>

              <Box sx={{ ml: 7 }}>
                {product.variants.map((variant) => (
                  <Box
                    key={variant.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Checkbox
                        checked={selectedProducts.some(
                          (item) =>
                            item.variants && item.variants.some((v) => v.id === variant.id)
                        )}
                        onChange={() => {
                          const parentProduct = selectedProducts.find(item => item.id === product.id);
                          if (parentProduct) {
                            // If parent exists, toggle variant
                            const hasVariant = parentProduct.variants.some(v => v.id === variant.id);
                            if (hasVariant) {
                              // Remove variant
                              setSelectedProducts(prev => prev.map(item => {
                                if (item.id === product.id) {
                                  return {
                                    ...item,
                                    variants: item.variants.filter(v => v.id !== variant.id)
                                  };
                                }
                                return item;
                              }));
                            } else {
                              // Add variant
                              setSelectedProducts(prev => prev.map(item => {
                                if (item.id === product.id) {
                                  return {
                                    ...item,
                                    variants: [...item.variants, variant]
                                  };
                                }
                                return item;
                              }));
                            }
                          } else {
                            // Add product with just this variant
                            setSelectedProducts(prev => [...prev, {
                              ...product,
                              variants: [variant]
                            }]);
                          }
                        }}
                        size="small"
                      />
                      <Typography variant="body2">
                        {variant.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {variant.inventory_quantity && (
                        <Typography variant="body2" color="text.secondary">
                          {variant.inventory_quantity} available
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ fontWeight: 500, width: 50 }}>
                        $ {variant.price}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Loading more products...
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          <Typography variant="body2" color="text.secondary">
            {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => onProductsSelect(selectedProducts)}
              sx={{
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.dark',
                }
              }}
            >
              Add
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ProductSelectorDialog;