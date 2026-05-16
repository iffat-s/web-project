import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { brandsApi } from '../api/client';
import toast from 'react-hot-toast';

export default function useBrand() {
  const { user } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role !== 'brand_manager') {
      setLoading(false);
      return;
    }

    const fetchBrand = async () => {
      try {
        const r = await brandsApi.getMyBrand();
        setBrand(r.data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('No brand assigned');
          toast.error('No brand assigned to your account');
          navigate('/brand');
        } else {
          setError('Failed to load brand');
          console.error('Error loading brand:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [user, navigate]);

  return { brand, loading, error };
}

