import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { brandsApi } from '../api/client';

export default function useBrand() {
  const { user } = useSelector(s => s.auth);
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    brandsApi.getAll().then(r => {
      const myBrand = r.data.find(b => b.manager?.id === user?.id) || r.data[0];
      setBrand(myBrand || null);
    }).finally(() => setLoading(false));
  }, [user]);

  return { brand, loading };
}
